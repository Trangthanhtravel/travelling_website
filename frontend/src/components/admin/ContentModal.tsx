import React, { useState, useEffect } from 'react';
import { Icon, Icons } from '../common/Icons';
import BilingualInput from '../common/BilingualInput';

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  title: string;
  initialData?: any;
}

const ContentModal: React.FC<ContentModalProps> = ({
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
    content: { en: '', vi: '' },
    type: 'setting',
    status: 'active'
  });

  // Populate form data when editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        key: initialData.key || '',
        title: {
          en: initialData.title || '',
          vi: initialData.title_vi || ''
        },
        content: {
          en: initialData.content || '',
          vi: initialData.content_vi || ''
        },
        type: initialData.type || 'setting',
        status: initialData.status || 'active'
      });
    } else {
      // Reset form for create mode
      setFormData({
        key: '',
        title: { en: '', vi: '' },
        content: { en: '', vi: '' },
        type: 'setting',
        status: 'active'
      });
    }
  }, [initialData, isOpen]);

  const handleBilingualChange = (name: string, value: { en: string; vi: string }) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transform data for API
    const submitData = {
      key: formData.key,
      title: formData.title.en,
      title_vi: formData.title.vi,
      content: formData.content.en,
      content_vi: formData.content.vi,
      type: formData.type,
      status: formData.status
    };

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
                Content Key *
              </label>
              <input
                type="text"
                name="key"
                value={formData.key}
                onChange={handleChange}
                placeholder="e.g., hero_title_1, about_section_text"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={!!initialData} // Disable editing key when updating
              />
              <p className="text-xs text-gray-500 mt-1">
                Unique identifier for this content (cannot be changed after creation)
              </p>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="setting">Setting</option>
                <option value="page">Page Content</option>
                <option value="section">Section Content</option>
              </select>
            </div>
          </div>

          {/* Title - Bilingual */}
          <BilingualInput
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleBilingualChange}
            placeholder={{
              en: "Enter title in English",
              vi: "Nhập tiêu đề bằng tiếng Việt"
            }}
            required={true}
          />

          {/* Content - Bilingual */}
          <BilingualInput
            label="Content"
            name="content"
            value={formData.content}
            onChange={handleBilingualChange}
            type="textarea"
            rows={6}
            placeholder={{
              en: "Enter content in English (text or image URL)",
              vi: "Nhập nội dung bằng tiếng Việt (văn bản hoặc URL hình ảnh)"
            }}
          />

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
              <span>{isLoading ? 'Saving...' : (initialData ? 'Update Content' : 'Create Content')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentModal;
