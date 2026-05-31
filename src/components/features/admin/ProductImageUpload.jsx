import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiFetch } from '@/api/httpClient';
import { toast } from 'sonner';

const IMAGE_TYPES = [
  { value: 'front', label: 'Front Image' },
  { value: 'back', label: 'Back Image' },
  { value: 'model_front', label: 'Model Front' },
  { value: 'model_back', label: 'Model Back' },
  { value: 'lifestyle', label: 'Lifestyle' },
];

export default function ProductImageUpload({ productId, existingImages = [], onUploadSuccess }) {
  const [selectedType, setSelectedType] = useState('front');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
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

    try {
      const result = await apiFetch('/api/uploads/cloudinary/product', {
        method: 'POST',
        body: formData,
        isFormData: true,
      });

      toast.success('Image uploaded successfully!');
      setFile(null);
      setPreview(null);
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId, publicId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await apiFetch(`/api/uploads/cloudinary/${imageId}`, { method: 'DELETE' });
      toast.success('Image deleted successfully');
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to delete image');
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="p-4 rounded-xl bg-card border border-white/5 space-y-4">
        <h3 className="font-syne font-bold text-sm text-foreground">Upload Product Image</h3>

        {/* Image Type Selection */}
        <div className="flex flex-wrap gap-2">
          {IMAGE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedType === type.value
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* File Input */}
        {!preview ? (
          <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
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
            <div className="relative rounded-xl overflow-hidden border border-white/10">
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
      {existingImages.length > 0 && (
        <div className="p-4 rounded-xl bg-card border border-white/5 space-y-3">
          <h3 className="font-syne font-bold text-sm text-foreground">Existing Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {existingImages.map((image) => (
              <div key={image.id} className="relative group">
                <img
                  src={image.url}
                  alt={image.type}
                  className="w-full h-32 object-cover rounded-lg border border-white/10"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => handleDelete(image.id, image.publicId)}
                    className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-black/50 text-white text-[10px] capitalize">
                  {image.type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
