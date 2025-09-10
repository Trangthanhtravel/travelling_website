import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, Icons } from '../../components/common/Icons';
import BilingualInput from '../../components/common/BilingualInput';

interface ContentItem {
  id: number;
  key: string;
  title: string;
  title_vi?: string;
  content: string;
  content_vi?: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const getApiUrl = () => {
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const ContentManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: { en: '', vi: '' },
    content: { en: '', vi: '' },
    image: null as File | null
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch content items for About Us and Booking Policy
  const { data: contentData, isLoading } = useQuery({
    queryKey: ['admin-content'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/admin/content`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch content');
      return response.json();
    },
  });

  // Update content mutation
  const updateContentMutation = useMutation({
    mutationFn: async (data: {
      id: number;
      title: string;
      title_vi: string;
      content: string;
      content_vi: string;
      hasImageUpdate?: boolean;
      imageFile?: File
    }) => {
      if (data.hasImageUpdate && data.imageFile) {
        // If we have an image update, use FormData to send both data and file
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('title_vi', data.title_vi);
        formData.append('content', data.content);
        formData.append('content_vi', data.content_vi);
        formData.append('image', data.imageFile);

        const response = await fetch(`${getApiUrl()}/admin/content/${data.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          },
          body: formData
        });
        if (!response.ok) throw new Error('Failed to update content with image');
        return response.json();
      } else {
        // Regular JSON update for text content
        const response = await fetch(`${getApiUrl()}/admin/content/${data.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: data.title,
            title_vi: data.title_vi,
            content: data.content,
            content_vi: data.content_vi
          })
        });
        if (!response.ok) throw new Error('Failed to update content');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      setIsEditModalOpen(false);
      setSelectedContent(null);
      setEditForm({ title: { en: '', vi: '' }, content: { en: '', vi: '' }, image: null });
    }
  });

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${getApiUrl()}/admin/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload image');
      return response.json();
    },
    onSuccess: (data) => {
      // Fix: Access the correct nested structure
      const imageUrl = data.data.imageUrl;
      setEditForm(prev => ({ ...prev, content: imageUrl }));
      setUploadingImage(false);
    }
  });

  const content = contentData?.data || [];

  // Filter content for About Us and Booking Policy
  const aboutUsContent = content.filter((item: ContentItem) =>
    item.key.startsWith('about_us_') || item.key.startsWith('booking_policy_')
  );

  const handleEdit = (contentItem: ContentItem) => {
    setSelectedContent(contentItem);
    setEditForm({
      title: {
        en: contentItem.title || '',
        vi: contentItem.title_vi || ''
      },
      content: {
        en: contentItem.content || '',
        vi: contentItem.content_vi || ''
      },
      image: null
    });
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    if (selectedContent) {
      const isImageContent = selectedContent.key.includes('image');
      const hasNewImage = editForm.image !== null;

      updateContentMutation.mutate({
        id: selectedContent.id,
        title: editForm.title.en,
        title_vi: editForm.title.vi,
        content: editForm.content.en,
        content_vi: editForm.content.vi,
        hasImageUpdate: isImageContent && hasNewImage,
        imageFile: hasNewImage ? editForm.image! : undefined
      });
    }
  };

  const handleBilingualChange = (name: string, value: { en: string; vi: string }) => {
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (file: File) => {
    setUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  const getContentDisplayName = (key: string) => {
    const displayNames: { [key: string]: string } = {
      'about_us_history': 'About Us - Company History',
      'about_us_image': 'About Us - Main Image',
      'about_us_vision': 'About Us - Vision Statement',
      'about_us_mission': 'About Us - Mission Statement',
      'booking_policy_title': 'Booking Policy - Page Title',
      'booking_policy_content': 'Booking Policy - Main Content'
    };
    return displayNames[key] || key;
  };

  const isImageContent = (key: string) => {
    return key.includes('image');
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-8 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
          <div className={`h-32 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
          <div className={`h-32 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
          Content Management
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {aboutUsContent.map((item: ContentItem) => (
          <div
            key={item.id}
            className={`p-6 rounded-lg border ${
              isDarkMode 
                ? 'bg-dark-800 border-dark-700' 
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
                  {getContentDisplayName(item.key)}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                  Key: {item.key}
                </p>
              </div>
              <button
                onClick={() => handleEdit(item)}
                className={`px-3 py-1 rounded text-sm border transition-colors ${
                  isDarkMode
                    ? 'border-dark-600 text-dark-text-secondary hover:bg-dark-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon icon={Icons.FiEdit2} className="w-4 h-4" />
              </button>
            </div>

            <div className={`text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
              {isImageContent(item.key) ? (
                <div className="space-y-2">
                  <img
                    src={item.content}
                    alt="Content"
                    className="w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <p className="text-xs break-all">{item.content}</p>
                </div>
              ) : (
                <p className="line-clamp-3">
                  {item.content.length > 150 ? `${item.content.substring(0, 150)}...` : item.content}
                </p>
              )}
            </div>

            <div className={`mt-4 text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
              Last updated: {new Date(item.updated_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg ${
            isDarkMode ? 'bg-dark-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
                  Edit {getContentDisplayName(selectedContent.key)}
                </h2>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className={`p-2 rounded-lg ${
                    isDarkMode 
                      ? 'hover:bg-dark-700 text-dark-text-primary' 
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon icon={Icons.FiX} className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Bilingual Title Input */}
                <BilingualInput
                  label="Title"
                  name="title"
                  value={editForm.title}
                  onChange={handleBilingualChange}
                  placeholder={{
                    en: "Enter title in English",
                    vi: "Nhập tiêu đề bằng tiếng Việt"
                  }}
                  required={true}
                />

                {/* Content Section */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'
                  }`}>
                    Content
                  </label>

                  {isImageContent(selectedContent.key) ? (
                    <div className="space-y-4">
                      {/* Image Upload Section */}
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setEditForm({ ...editForm, image: file });
                              handleImageUpload(file);
                            }
                          }}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className={`px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'border-dark-600 text-dark-text-secondary hover:bg-dark-700'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {uploadingImage ? 'Uploading...' : 'Upload New Image'}
                        </label>
                      </div>

                      {/* Bilingual Image URL Input */}
                      <BilingualInput
                        label="Image URL"
                        name="content"
                        value={editForm.content}
                        onChange={handleBilingualChange}
                        placeholder={{
                          en: "Enter image URL in English",
                          vi: "Nhập URL hình ảnh bằng tiếng Việt"
                        }}
                      />

                      {/* Image Preview */}
                      {(editForm.content.en || editForm.content.vi) && (
                        <div className="space-y-2">
                          {editForm.content.en && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">English Image Preview:</p>
                              <img
                                src={editForm.content.en}
                                alt="English Preview"
                                className="w-full h-auto max-h-48 object-contain rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                            </div>
                          )}
                          {editForm.content.vi && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Vietnamese Image Preview:</p>
                              <img
                                src={editForm.content.vi}
                                alt="Vietnamese Preview"
                                className="w-full h-auto max-h-48 object-contain rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Bilingual Text Content Input */
                    <BilingualInput
                      label="Content"
                      name="content"
                      value={editForm.content}
                      onChange={handleBilingualChange}
                      type="textarea"
                      rows={12}
                      placeholder={{
                        en: "Enter content in English",
                        vi: "Nhập nội dung bằng tiếng Việt"
                      }}
                    />
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className={`px-6 py-2 rounded-lg border transition-colors ${
                      isDarkMode
                        ? 'border-dark-600 text-dark-text-secondary hover:bg-dark-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={updateContentMutation.isPending}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {updateContentMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
