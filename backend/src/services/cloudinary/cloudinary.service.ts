import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export interface UploadResult {
  publicId: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadOptions {
  folder?: string;
  transformation?: string;
  resource_type?: 'image' | 'auto';
  quality?: 'auto' | 'good' | 'best' | 'eco' | 'low';
  width?: number;
  height?: number;
  crop?: 'scale' | 'fit' | 'fill' | 'limit' | 'pad' | 'thumb';
}

/**
 * Upload an image to Cloudinary with automatic optimization
 */
export async function uploadImage(
  fileBuffer: Buffer,
  filename: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = 'animenation/products',
    transformation,
    resource_type = 'image',
    quality = 'auto',
    width,
    height,
    crop = 'limit',
  } = options;

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          public_id: filename,
          resource_type,
          transformation: transformation || [
            { quality },
            { fetch_format: 'auto' },
            width ? { width, crop } : undefined,
            height ? { height, crop } : undefined,
          ].filter(Boolean),
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result) {
            reject(new Error('Upload failed: No result from Cloudinary'));
            return;
          }
          resolve({
            publicId: result.public_id,
            url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
          });
        }
      )
      .end(fileBuffer);
  });
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

/**
 * Generate optimized URL with transformations
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpg' | 'png' | 'auto';
    crop?: 'scale' | 'fit' | 'fill' | 'limit' | 'pad' | 'thumb';
  } = {}
): string {
  const { width, height, quality = 80, format = 'auto', crop = 'limit' } = options;
  
  const transformations = [
    quality ? { quality } : undefined,
    { fetch_format: format },
    width ? { width, crop } : undefined,
    height ? { height, crop } : undefined,
  ].filter(Boolean);

  return cloudinary.url(publicId, {
    transformation: transformations,
  });
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size = 300): string {
  return getOptimizedUrl(publicId, {
    width: size,
    height: size,
    crop: 'fill',
    quality: 70,
  });
}

export default cloudinary;
