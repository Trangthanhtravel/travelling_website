import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, Icons } from '../../components/common/Icons';

interface ContentItem {
  id: number;
  key: string;
  title: string;
  content: string;
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
    title: '',
    content: '',
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
    mutationFn: async (data: { id: number; title: string; content: string }) => {
      const response = await fetch(`${getApiUrl()}/admin/content/${data.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content
        })
      });
      if (!response.ok) throw new Error('Failed to update content');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-content'] });
      setIsEditModalOpen(false);
      setSelectedContent(null);
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
      setEditForm(prev => ({ ...prev, content: data.imageUrl }));
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
      title: contentItem.title,
      content: contentItem.content,
      image: null
    });
    setIsEditModalOpen(true);
  };

  const handleSave = () => {
    if (selectedContent) {
      updateContentMutation.mutate({
        id: selectedContent.id,
        title: editForm.title,
        content: editForm.content
      });
    }
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
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'
                  }`}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode
                        ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'
                  }`}>
                    Content
                  </label>

                  {isImageContent(selectedContent.key) ? (
                    <div className="space-y-4">
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

                      <input
                        type="url"
                        value={editForm.content}
                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                        placeholder="Or enter image URL directly"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                          isDarkMode
                            ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />

                      {editForm.content && (
                        <img
                          src={editForm.content}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={12}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter content here..."
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
