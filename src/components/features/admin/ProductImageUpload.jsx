import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/api/httpClient';
import { toastService } from '@/lib/toast-service';

const IMAGE_TYPES = [
  { value: 'front', label: 'Front Image' },
  { value: 'back', label: 'Back Image' },
  { value: 'model_front', label: 'Model Front' },
  { value: 'model_back', label: 'Model Back' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

const MAX_IMAGES = 5;

export default function ProductImageUpload({ productId, existingImages = [], onUploadSuccess }) {
  const [selectedType, setSelectedType] = useState('front');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(existingImages);

  // Update images when existingImages prop changes
  React.useEffect(() => {
    setImages(existingImages);
  }, [existingImages]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check if we've reached the max limit
    if (images.length >= MAX_IMAGES) {
      toastService.error(`Maximum ${MAX_IMAGES} images allowed per product`);
      return;
    }

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toastService.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toastService.error('Image size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file || !productId) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);
    formData.append('type', selectedType);
    formData.append('sortOrder', images.length.toString());

    try {
      const result = await apiFetch('/api/uploads/cloudinary/product', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });

      toastService.success('Image uploaded successfully!');
      setFile(null);
      setPreview(null);
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (error) {
      toastService.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId, publicId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await apiFetch(`/api/uploads/cloudinary/${imageId}`, { method: 'DELETE' });
      toastService.success('Image deleted successfully');
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      toastService.error(error.message || 'Failed to delete image');
    }
  };

  const handleReorder = async (imageId, direction) => {
    // NOTE: Reorder endpoint not implemented in backend yet
    // Backend needs: PATCH /api/uploads/cloudinary/:id/reorder
    // For now, this is disabled
    toastService.info('Image reordering requires backend implementation');
    return;

    const currentIndex = images.findIndex(img => img.id === imageId);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    const [movedImage] = newImages.splice(currentIndex, 1);
    newImages.splice(newIndex, 0, movedImage);

    // Update sortOrder for all affected images
    try {
      await Promise.all(
        newImages.map((img, index) =>
          apiFetch(`/api/uploads/cloudinary/${img.id}/reorder`, {
            method: 'PATCH',
            body: { sortOrder: index },
          })
        )
      );
      setImages(newImages);
      toastService.success('Image order updated');
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      toastService.error(error.message || 'Failed to reorder images');
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-syne font-bold text-sm text-foreground">Upload Product Image</h3>
          <span className="text-xs text-muted-foreground">{images.length}/{MAX_IMAGES} images</span>
        </div>

        {/* Image Type Selection */}
        <div className="flex flex-wrap gap-2">
          {IMAGE_TYPES.map((type) => {
            const isTypeUsed = images.some(img => img.type === type.value);
            return (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                disabled={isTypeUsed}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedType === type.value
                    ? 'bg-primary text-primary-foreground'
                    : isTypeUsed
                    ? 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {type.label} {isTypeUsed && '(Used)'}
              </button>
            );
          })}
        </div>

        {/* File Input */}
        {!preview ? (
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            images.length >= MAX_IMAGES
              ? 'border-muted opacity-50 cursor-not-allowed'
              : 'border-border hover:border-primary/50 cursor-pointer'
          }`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={images.length >= MAX_IMAGES}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer flex flex-col items-center gap-2 ${images.length >= MAX_IMAGES ? 'pointer-events-none' : ''}`}
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WEBP up to 5MB
              </p>
            </label>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                onClick={clearFile}
                className="absolute top-2 right-2 p-2 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full font-syne font-bold"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload Image'
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Existing Images */}
      {images.length > 0 && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-3">
          <h3 className="font-syne font-bold text-sm text-foreground">Product Images</h3>
          <div className="space-y-2">
            {images.map((image, index) => (
              <div key={image.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleReorder(image.id, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReorder(image.id, 'down')}
                    disabled={index === images.length - 1}
                    className="p-1 rounded hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                <img
                  src={image.url}
                  alt={image.type}
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground capitalize truncate">
                    {image.type.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {image.width}x{image.height} • {image.format}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(image.id, image.publicId)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
