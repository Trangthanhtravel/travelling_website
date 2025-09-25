import React, { useState, useEffect } from 'react';
import { Icon, Icons } from '../common/Icons';
import BilingualInput from '../common/BilingualInput';

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  title: string;
  initialData?: any;
  categories: any[];
}

const TourModal: React.FC<TourModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  initialData,
  categories
}) => {
  const [formData, setFormData] = useState({
    title: { en: '', vi: '' },
    description: { en: '', vi: '' },
    location: { en: '', vi: '' },
    duration: { en: '', vi: '' },
    included: { en: '', vi: '' },
    excluded: { en: '', vi: '' },
    price: 0,
    max_participants: 1,
    category: '',
    status: 'active',
    featured: false,
    image: undefined as File | undefined
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Populate form data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: {
          en: initialData.title || '',
          vi: initialData.title_vi || ''
        },
        description: {
          en: initialData.description || '',
          vi: initialData.description_vi || ''
        },
        location: {
          en: initialData.location || '',
          vi: initialData.location_vi || ''
        },
        duration: {
          en: initialData.duration || '',
          vi: initialData.duration_vi || ''
        },
        included: {
          en: Array.isArray(initialData.included) ? initialData.included.join('\n') : '',
          vi: Array.isArray(initialData.included_vi) ? initialData.included_vi.join('\n') : ''
        },
        excluded: {
          en: Array.isArray(initialData.excluded) ? initialData.excluded.join('\n') : '',
          vi: Array.isArray(initialData.excluded_vi) ? initialData.excluded_vi.join('\n') : ''
        },
        price: initialData.price || 0,
        max_participants: initialData.max_participants || 1,
        category: initialData.category || '',
        status: initialData.status || 'active',
        featured: initialData.featured || false,
        image: undefined
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: { en: '', vi: '' },
        description: { en: '', vi: '' },
        location: { en: '', vi: '' },
        duration: { en: '', vi: '' },
        included: { en: '', vi: '' },
        excluded: { en: '', vi: '' },
        price: 0,
        max_participants: 1,
        category: '',
        status: 'active',
        featured: false,
        image: undefined
      });
    }
  }, [initialData, isOpen]);

  const handleBilingualChange = (name: string, value: { en: string; vi: string }) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert array fields from strings to arrays
    const submitData = {
      ...formData,
      included: {
        en: formData.included.en.split('\n').filter(item => item.trim()),
        vi: formData.included.vi.split('\n').filter(item => item.trim())
      },
      excluded: {
        en: formData.excluded.en.split('\n').filter(item => item.trim()),
        vi: formData.excluded.vi.split('\n').filter(item => item.trim())
      }
    };

    onSubmit(submitData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });

      // Create preview URL for the new image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset image preview when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setImagePreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Icon icon={Icons.FiX} className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <BilingualInput
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleBilingualChange}
              placeholder={{
                en: "Enter tour title in English",
                vi: "Nhập tiêu đề tour bằng tiếng Việt"
              }}
              required
            />

            {/* Description */}
            <BilingualInput
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleBilingualChange}
              type="textarea"
              placeholder={{
                en: "Enter tour description in English",
                vi: "Nhập mô tả tour bằng tiếng Việt"
              }}
              rows={6}
              required
            />

            {/* Location */}
            <BilingualInput
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleBilingualChange}
              placeholder={{
                en: "Enter location in English",
                vi: "Nhập địa điểm bằng tiếng Việt"
              }}
              required
            />

            {/* Duration */}
            <BilingualInput
              label="Duration"
              name="duration"
              value={formData.duration}
              onChange={handleBilingualChange}
              placeholder={{
                en: "e.g., 3 days 2 nights",
                vi: "ví dụ: 3 ngày 2 đêm"
              }}
              required
            />

            {/* Price and Max Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Participants <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* What's Included */}
            <BilingualInput
              label="What's Included"
              name="included"
              value={formData.included}
              onChange={handleBilingualChange}
              type="array"
              placeholder={{
                en: "Enter what's included (one per line)",
                vi: "Nhập những gì được bao gồm (mỗi dòng một mục)"
              }}
            />

            {/* What's Excluded */}
            <BilingualInput
              label="What's Excluded"
              name="excluded"
              value={formData.excluded}
              onChange={handleBilingualChange}
              type="array"
              placeholder={{
                en: "Enter what's excluded (one per line)",
                vi: "Nhập những gì không được bao gồm (mỗi dòng một mục)"
              }}
            />

            {/* Status and Featured */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Featured Tour
                </label>
              </div>
            </div>

            {/* Image Upload with Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tour Image
              </label>

              {/* Current Image Preview (when editing) */}
              {initialData?.image && !imagePreview && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Image:</p>
                  <div className="relative">
                    <img
                      src={initialData.image}
                      alt="Current tour"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Current
                    </div>
                  </div>
                </div>
              )}

              {/* New Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New Image Preview:</p>
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="New tour preview"
                      className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                    />
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      New
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: undefined });
                        // Reset file input
                        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                      title="Remove new image"
                    >
                      <Icon icon={Icons.FiX} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* File Input */}
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/20 dark:file:text-blue-300"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload a high-quality image for your tour. Max 5MB. Supported formats: JPG, PNG, WebP.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center"
                disabled={isLoading}
              >
                {isLoading && <Icon icon={Icons.FiLoader} className="w-4 h-4 mr-2 animate-spin" />}
                {initialData ? 'Update Tour' : 'Create Tour'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TourModal;

