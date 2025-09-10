import React, { useState, useEffect } from 'react';
import { Icon, Icons } from '../common/Icons';
import BilingualInput from '../common/BilingualInput';

interface HeroImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  title: string;
  initialData?: any;
}

const HeroImageModal: React.FC<HeroImageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  initialData
}) => {
  const [formData, setFormData] = useState({
    key: '',
    title: { en: '', vi: '' },
    imageUrl: '',
    type: 'setting',
    status: 'active'
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Populate form data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        key: initialData.key || '',
        title: {
          en: initialData.title || '',
          vi: initialData.title_vi || ''
        },
        imageUrl: initialData.content || '',
        type: initialData.type || 'setting',
        status: initialData.status || 'active'
      });
      setImagePreview(initialData.content || '');
    } else {
      // Reset form for create mode
      setFormData({
        key: '',
        title: { en: '', vi: '' },
        imageUrl: '',
        type: 'setting',
        status: 'active'
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  const handleBilingualChange = (name: string, value: { en: string; vi: string }) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      imageUrl: url
    }));
    setImagePreview(url);
    setImageFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData for file upload if image file is selected
    const submitData = new FormData();
    submitData.append('key', formData.key);
    submitData.append('title', formData.title.en);
    submitData.append('title_vi', formData.title.vi);
    submitData.append('type', formData.type);
    submitData.append('status', formData.status);

    if (imageFile) {
      submitData.append('image', imageFile);
    } else {
      submitData.append('content', formData.imageUrl);
    }

    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            disabled={isLoading}
          >
            <Icon icon={Icons.FiX} className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Key *
              </label>
              <input
                type="text"
                name="key"
                value={formData.key}
                onChange={handleChange}
                placeholder="e.g., hero_image_1, hero_title_1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!initialData}
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for this hero content
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Title - Bilingual */}
          <BilingualInput
            label="Hero Title"
            name="title"
            value={formData.title}
            onChange={handleBilingualChange}
            placeholder={{
              en: "Enter hero title in English",
              vi: "Nhập tiêu đề hero bằng tiếng Việt"
            }}
            required={true}
          />

          {/* Image Upload or URL */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Hero Image
            </label>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Upload New Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* OR */}
            <div className="text-center text-gray-500 font-medium">OR</div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleImageUrlChange}
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview
                </label>
                <div className="border border-gray-300 rounded-lg p-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading && <Icon icon={Icons.FiLoader} className="w-4 h-4 animate-spin" />}
              <span>{isLoading ? 'Saving...' : (initialData ? 'Update Hero' : 'Create Hero')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeroImageModal;
