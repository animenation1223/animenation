import type { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import { HttpError } from "../middleware/errorHandler";
import { prisma } from "../../../infra/prisma";
import { uploadImage, deleteImage } from "../../../services/cloudinary/cloudinary.service";

type ImageType = 'front' | 'back' | 'model_front' | 'model_back' | 'lifestyle';

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

export const uploadFileHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "No file uploaded");
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    const safeName = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const dest = path.join(UPLOAD_DIR, safeName);
    fs.writeFileSync(dest, req.file.buffer);
    const baseUrl = process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;
    res.json({ file_url: `${baseUrl}/uploads/${safeName}` });
  } catch (e) {
    next(e);
  }
};

export const uploadCloudinaryImageHandler: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "No file uploaded");
    
    const { productId, type = 'front' } = req.body as { productId?: string; type?: string };
    
    if (!productId) throw new HttpError(400, "Product ID is required");
    
    // Validate image type
    const validTypes: ImageType[] = ['front', 'back', 'model_front', 'model_back', 'lifestyle'];
    if (!validTypes.includes(type as ImageType)) {
      throw new HttpError(400, `Invalid image type. Must be one of: ${validTypes.join(', ')}`);
    }
    
    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    
    if (!product) throw new HttpError(404, "Product not found");
    
    // Upload to Cloudinary
    const filename = `product-${productId}-${type}-${Date.now()}`;
    const result = await uploadImage(req.file.buffer, filename, {
      folder: 'animenation/products',
      quality: 'auto',
      width: 1200,
      height: 1200,
      crop: 'limit',
    });
    
    // Delete existing image of same type if it exists
    const existingImage = await prisma.productImage.findUnique({
      where: { productId_type: { productId, type: type as ImageType } },
    });
    
    if (existingImage) {
      // Delete from Cloudinary
      await deleteImage(existingImage.publicId);
      // Delete from database
      await prisma.productImage.delete({
        where: { id: existingImage.id },
      });
    }
    
    // Create new product image record
    const productImage = await prisma.productImage.create({
      data: {
        productId,
        type: type as ImageType,
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
    
    // Update product's main imageUrl if this is a front image
    if (type === 'front') {
      await prisma.product.update({
        where: { id: productId },
        data: { imageUrl: result.url },
      });
    }
    
    res.status(201).json({
      id: productImage.id,
      url: productImage.url,
      type: productImage.type,
      width: productImage.width,
      height: productImage.height,
    });
  } catch (e) {
    next(e);
  }
};

export const deleteCloudinaryImageHandler: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const image = await prisma.productImage.findUnique({
      where: { id },
      include: { product: true },
    });
    
    if (!image) throw new HttpError(404, "Image not found");
    
    // Delete from Cloudinary
    await deleteImage(image.publicId);
    
    // Delete from database
    await prisma.productImage.delete({
      where: { id },
    });
    
    // Update product's imageUrl if this was the front image
    if (image.type === 'front') {
      const remainingFrontImage = await prisma.productImage.findFirst({
        where: { productId: image.productId, type: 'front' },
      });
      
      await prisma.product.update({
        where: { id: image.productId },
        data: { imageUrl: remainingFrontImage?.url || null },
      });
    }
    
    res.status(204).send();
  } catch (e) {
    next(e);
  }
};

export const getProductImagesHandler: RequestHandler = async (req, res, next) => {
  try {
    const { productId } = req.params;
    
    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });
    
    res.json(images);
  } catch (e) {
    next(e);
  }
};
