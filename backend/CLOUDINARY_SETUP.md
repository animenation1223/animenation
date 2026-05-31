# Cloudinary Integration Setup

This document describes the Cloudinary integration for product image uploads in AnimeNation.

## Required Environment Variables

Add these to your `backend/.env` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Getting Cloudinary Credentials

1. Go to [Cloudinary.com](https://cloudinary.com/)
2. Sign up for an account (free tier available)
3. Navigate to the Dashboard
4. Copy your Cloud Name, API Key, and API Secret
5. Add them to your `.env` file

## Database Migration Required

The integration adds a new `ProductImage` model to support multiple product images with types. You need to run a migration:

```bash
cd backend
npx prisma migrate dev --name add_product_images
npx prisma generate
```

## API Endpoints

### Upload Product Image
- **POST** `/api/uploads/cloudinary/product`
- **Authentication**: Required
- **Body**: FormData with `file`, `productId`, `type`
- **Image Types**: `front`, `back`, `model_front`, `model_back`, `lifestyle`

### Get Product Images
- **GET** `/api/uploads/cloudinary/product/:productId`
- **Authentication**: Not required

### Delete Product Image
- **DELETE** `/api/uploads/cloudinary/:id`
- **Authentication**: Required

## Image Optimization

Images are automatically optimized using Cloudinary transformations:
- Auto quality adjustment
- Auto format selection (WebP, JPG, PNG)
- Max dimensions: 1200x1200px
- Crop: limit (maintains aspect ratio)

## Supported Image Types

- **front**: Main product image (front view)
- **back**: Product back view
- **model_front**: Model wearing product (front)
- **model_back**: Model wearing product (back)
- **lifestyle**: Lifestyle/scene image

## Frontend Component

Use the `ProductImageUpload` component for admin image uploads:

```jsx
import ProductImageUpload from '@/components/features/admin/ProductImageUpload';

<ProductImageUpload 
  productId={productId}
  existingImages={images}
  onUploadSuccess={handleSuccess}
/>
```

## Features

- Automatic image optimization
- Multiple image types per product
- Image preview before upload
- Delete images from Cloudinary
- Front image automatically set as product main image
- File size validation (max 5MB)
- File type validation (images only)
