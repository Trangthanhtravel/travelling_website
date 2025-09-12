import React, { useState, useRef } from 'react';
import { Icon, Icons } from '../common/Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/TranslationContext';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  currentImage?: string;
  uploadType: 'featured' | 'content';
  className?: string;
  acceptMultiple?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  currentImage,
  uploadType,
  className = '',
  acceptMultiple = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    const file = files[0]; // For now, handle single file

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('Please select an image file'));
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('Image must be less than 5MB'));
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const endpoint = uploadType === 'featured' ? 'upload-featured-image' : 'upload-content-image';
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/blogs/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      onImageUploaded(result.data.imageUrl);
      toast.success(t('Image uploaded successfully'));
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error.message || t('Failed to upload image'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        multiple={acceptMultiple}
      />

      {currentImage ? (
        // Show current image with option to replace
        <div className={`relative rounded-lg border-2 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'} overflow-hidden`}>
          <img
            src={currentImage}
            alt="Uploaded"
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/400/300';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="flex space-x-2">
              <button
                onClick={openFileDialog}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors"
              >
                <Icon icon={Icons.FiUpload} className="h-4 w-4" />
                <span>{t('Replace')}</span>
              </button>
              <button
                onClick={removeImage}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center space-x-1 transition-colors"
              >
                <Icon icon={Icons.FiTrash2} className="h-4 w-4" />
                <span>{t('Remove')}</span>
              </button>
            </div>
          </div>
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      ) : (
        // Show upload area
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${dragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : isDarkMode 
                ? 'border-gray-600 hover:border-gray-500 bg-gray-800/50' 
                : 'border-gray-300 hover:border-gray-400 bg-gray-50'
            }
            ${isUploading ? 'pointer-events-none' : ''}
          `}
        >
          {isUploading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {t('Uploading image...')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Icon
                icon={Icons.FiUpload}
                className={`h-12 w-12 mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
              />
              <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                {t('Upload Image')}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                {t('Drag and drop or click to select')}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {t('JPEG, PNG, WebP up to 5MB')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
