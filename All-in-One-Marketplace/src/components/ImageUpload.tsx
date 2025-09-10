import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
  onImageChange?: (imageUrl: string) => void;
  onImagesChange?: (imageUrls: string[]) => void;
  currentImage?: string;
  currentImages?: string[];
  maxImages?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImageChange, 
  onImagesChange, 
  currentImage, 
  currentImages = [], 
  maxImages = 1, 
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImages.length > 0 ? currentImages : (currentImage ? [currentImage] : []));
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isMultiple = maxImages > 1;

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed maxImages
    if (previews.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Each image should be less than 5MB');
        return;
      }
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('http://localhost:5000/api/upload/image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const result = await response.json();
        return result.imageUrl;
      });

      const imageUrls = await Promise.all(uploadPromises);
      const newPreviews = [...previews, ...imageUrls];
      
      setPreviews(newPreviews);
      
      if (isMultiple && onImagesChange) {
        onImagesChange(newPreviews);
      } else if (!isMultiple && onImageChange && imageUrls[0]) {
        onImageChange(imageUrls[0]);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    
    if (isMultiple && onImagesChange) {
      onImagesChange(newPreviews);
    } else if (!isMultiple && onImageChange) {
      onImageChange(newPreviews[0] || '');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={isMultiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      {previews.length > 0 ? (
        <div className="space-y-4">
          <div className={`grid gap-4 ${isMultiple ? (previews.length <= 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4') : 'grid-cols-1'}`}>
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <div className="w-full h-48 rounded-xl border-2 border-gray-200 overflow-hidden">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          
          {isMultiple && previews.length < maxImages && (
            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`w-full h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center transition-all ${
                uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                  <span className="text-gray-600 text-sm">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Upload className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-gray-600 text-sm">Add more images ({previews.length}/{maxImages})</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center transition-all ${
            uploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
              <span className="text-gray-600">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-gray-600 font-medium">
                Click to upload {isMultiple ? `images (max ${maxImages})` : 'image'}
              </span>
              <span className="text-gray-400 text-sm mt-1">PNG, JPG up to 5MB each</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;