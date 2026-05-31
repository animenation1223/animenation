import { Router } from "express";
import path from "path";
import {
  uploadFileHandler,
  uploadCloudinaryImageHandler,
  deleteCloudinaryImageHandler,
  getProductImagesHandler,
} from "../../controllers/upload.controller";
import { requireAuth } from "../../middleware/requireAuth";
import multer from "multer";

const uploadRouter = Router();

// Configure multer for memory storage (for Cloudinary)
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Configure multer for disk storage (for local uploads)
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// Legacy local file upload (for admin products)
uploadRouter.post("/file", upload.single("file"), uploadFileHandler);

// Cloudinary product image upload (requires auth)
uploadRouter.post(
  "/cloudinary/product",
  requireAuth,
  upload.single("file"),
  uploadCloudinaryImageHandler
);

// Get all images for a product
uploadRouter.get("/cloudinary/product/:productId", getProductImagesHandler);

// Delete a product image (requires auth)
uploadRouter.delete("/cloudinary/:id", requireAuth, deleteCloudinaryImageHandler);

export { uploadRouter };
