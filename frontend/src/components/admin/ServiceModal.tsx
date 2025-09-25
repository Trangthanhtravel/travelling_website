import React, { useState, useEffect } from 'react';
import { Icon, Icons } from '../common/Icons';
import BilingualInput from '../common/BilingualInput';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  title: string;
  initialData?: any;
  categories: any[];
}

const ServiceModal: React.FC<ServiceModalProps> = ({
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
    subtitle: { en: '', vi: '' },
    duration: { en: '', vi: '' },
    included: { en: '', vi: '' },
    excluded: { en: '', vi: '' },
    price: 0,
    category_id: '',
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
        subtitle: {
          en: initialData.subtitle || '',
          vi: initialData.subtitle_vi || ''
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
        category_id: initialData.category_id || '',
        status: initialData.status || 'active',
        featured: initialData.featured || false,
        image: undefined
      });
    } else {
      // Reset form for create mode
      setFormData({
        title: { en: '', vi: '' },
        description: { en: '', vi: '' },
        subtitle: { en: '', vi: '' },
        duration: { en: '', vi: '' },
        included: { en: '', vi: '' },
        excluded: { en: '', vi: '' },
        price: 0,
        category_id: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert included/excluded from text to arrays
    const processedData = {
      ...formData,
      included: formData.included.en.split('\n').filter(item => item.trim()),
      excluded: formData.excluded.en.split('\n').filter(item => item.trim()),
      included_vi: formData.included.vi.split('\n').filter(item => item.trim()),
      excluded_vi: formData.excluded.vi.split('\n').filter(item => item.trim())
    };

    onSubmit(processedData);
  };

  // Reset image preview when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setImagePreview(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={onClose}></div>

        {/* Modal */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-dark-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-dark-700">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <Icon icon={Icons.FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Service Title */}
                <BilingualInput
                  label="Service Title"
                  name="title"
                  value={formData.title}
                  onChange={handleBilingualChange}
                  placeholder={{
                    en: "Enter service title in English",
                    vi: "Nhập tiêu đề dịch vụ bằng tiếng Việt"
                  }}
                  required
                />

                {/* Service Subtitle */}
                <BilingualInput
                  label="Service Subtitle"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleBilingualChange}
                  placeholder={{
                    en: "Enter service subtitle in English",
                    vi: "Nhập tiêu đề phụ dịch vụ bằng tiếng Việt"
                  }}
                />

                {/* Duration */}
                <BilingualInput
                  label="Duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleBilingualChange}
                  placeholder={{
                    en: "e.g., 2 hours, Full day",
                    vi: "VD: 2 giờ, Cả ngày"
                  }}
                />

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (USD) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Description */}
                <BilingualInput
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleBilingualChange}
                  type="textarea"
                  rows={6}
                  placeholder={{
                    en: "Enter detailed service description in English",
                    vi: "Nhập mô tả chi tiết dịch vụ bằng tiếng Việt"
                  }}
                  required
                />

                {/* Included Services */}
                <BilingualInput
                  label="Included Services"
                  name="included"
                  value={formData.included}
                  onChange={handleBilingualChange}
                  type="textarea"
                  rows={4}
                  placeholder={{
                    en: "Enter each included service on a new line",
                    vi: "Nhập mỗi dịch vụ bao gồm trên một dòng mới"
                  }}
                />

                {/* Excluded Services */}
                <BilingualInput
                  label="Excluded Services"
                  name="excluded"
                  value={formData.excluded}
                  onChange={handleBilingualChange}
                  type="textarea"
                  rows={4}
                  placeholder={{
                    en: "Enter each excluded service on a new line",
                    vi: "Nhập mỗi dịch vụ không bao gồm trên một dòng mới"
                  }}
                />

                {/* Image Upload with Preview */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Image
                  </label>

                  {/* Current Image Preview (when editing) */}
                  {initialData?.image && !imagePreview && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Image:</p>
                      <div className="relative">
                        <img
                          src={initialData.image}
                          alt="Current"
                          className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
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
                          alt="New service preview"
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
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/20 dark:file:text-blue-300"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Upload a high-quality image for your service. Max 5MB. Supported formats: JPG, PNG, WebP.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t dark:border-dark-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <Icon icon={Icons.FiLoader} className="animate-spin w-4 h-4 mr-2" />
                    {initialData ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  initialData ? 'Update Service' : 'Create Service'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
