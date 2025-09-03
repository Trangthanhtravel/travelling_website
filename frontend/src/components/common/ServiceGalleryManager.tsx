import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Icons } from './Icons';
import toast from 'react-hot-toast';

interface ServiceGalleryManagerProps {
  service: {
    id: string;
    title: string;
    slug?: string;
    gallery?: string[];
  };
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceGalleryManager: React.FC<ServiceGalleryManagerProps> = ({
  service,
  onClose,
  onSuccess
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [localGallery, setLocalGallery] = useState<string[]>(service.gallery || []);
  const queryClient = useQueryClient();

  // Update local gallery when service prop changes
  useEffect(() => {
    setLocalGallery(service.gallery || []);
  }, [service.gallery]);

  // API functions
  const updateGallery = async (files: FileList) => {
    const token = localStorage.getItem('adminToken'); // Fixed: use 'adminToken' instead of 'token'
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/services/admin/services/${service.id}/gallery`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update service gallery');
    }

    return response.json();
  };

  const deleteGalleryPhoto = async (photoUrl: string) => {
    const token = localStorage.getItem('adminToken'); // Fixed: use 'adminToken' instead of 'token'
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }

    const encodedUrl = encodeURIComponent(photoUrl);
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/services/admin/services/${service.id}/gallery/${encodedUrl}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete photo');
    }

    return response.json();
  };

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: updateGallery,
    onSuccess: (data) => {
      console.log('Upload success:', data);

      // Update local state immediately
      if (data?.data?.gallery) {
        setLocalGallery(data.data.gallery);
        // Update parent component with the fresh data but don't close modal
        onSuccess?.();
      }

      // Clear selected files
      setSelectedFiles(null);

      // Safely invalidate queries with error handling
      try {
        queryClient.invalidateQueries({ queryKey: ['admin-services'] });
        if (service?.id) {
          queryClient.invalidateQueries({ queryKey: ['admin-service', service.id] });
        }
      } catch (queryError) {
        console.warn('Query invalidation failed:', queryError);
        // Continue without throwing error since the operation succeeded
      }

      // Success notification
      toast.success('Service gallery updated successfully! Modal will stay open for more uploads.');
    },
    onError: (error: any) => {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to update service gallery');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGalleryPhoto,
    onSuccess: (data) => {
      console.log('Delete success:', data);

      // Update local state immediately
      if (data?.data?.gallery !== undefined) {
        setLocalGallery(data.data.gallery);
        // Update parent component with the fresh data
        onSuccess?.();
      }

      // Safely invalidate queries with error handling
      try {
        queryClient.invalidateQueries({ queryKey: ['admin-services'] });
        if (service?.id) {
          queryClient.invalidateQueries({ queryKey: ['admin-service', service.id] });
        }
      } catch (queryError) {
        console.warn('Query invalidation failed:', queryError);
        // Continue without throwing error since the operation succeeded
      }

      // Success notification
      toast.success('Photo deleted successfully!');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete photo');
    }
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (files.length > 10) {
        toast.error('Maximum 10 photos allowed');
        return;
      }

      // Check file sizes
      const maxSize = 5 * 1024 * 1024; // 5MB
      for (let i = 0; i < files.length; i++) {
        if (files[i].size > maxSize) {
          toast.error(`File ${files[i].name} is too large. Maximum size is 5MB.`);
          return;
        }
      }

      setSelectedFiles(files);
    }
  };

  const handleUpload = () => {
    if (!selectedFiles) return;

    if (localGallery.length + selectedFiles.length > 10) {
      toast.error('Total gallery photos cannot exceed 10');
      return;
    }

    uploadMutation.mutate(selectedFiles);
  };

  const handleDeletePhoto = (photoUrl: string) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      deleteMutation.mutate(photoUrl);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Manage Service Photo Gallery</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Icon icon={Icons.FiX} className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Upload up to 10 high-quality photos for the service gallery
          </p>
        </div>

        <div className="p-6">
          {/* Current Gallery */}
          {localGallery && localGallery.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                Current Gallery ({localGallery.length}/10)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {localGallery.map((photo, index) => {
                  // Skip rendering if photo URL is malformed or empty
                  if (!photo || photo.includes('undefined') || photo.startsWith('https://https://')) {
                    return null;
                  }

                  return (
                    <div key={`gallery-${index}-${photo.split('/').pop()}`} className="relative group">
                      <img
                        src={photo}
                        alt={`Service Gallery ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-dark-600"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Prevent infinite error loops
                          if (target.dataset.errorHandled === 'true') {
                            return;
                          }

                          console.error('Image failed to load:', photo);
                          target.dataset.errorHandled = 'true';

                          // Hide the image instead of replacing with fallback to prevent more errors
                          target.style.display = 'none';

                          // Show error message in place of image
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.error-message')) {
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message w-full h-32 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex flex-col items-center justify-center text-red-600 dark:text-red-400 text-sm';
                            errorDiv.innerHTML = `
                              <div class="text-center p-2">
                                <div class="mb-1">❌ Failed to load</div>
                                <div class="text-xs text-red-500 dark:text-red-400">Check R2 bucket access</div>
                              </div>
                            `;
                            parent.appendChild(errorDiv);
                          }
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          delete target.dataset.errorHandled;
                          target.style.display = 'block';
                          console.log('Image loaded successfully:', photo);
                        }}
                      />
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        disabled={deleteMutation.isPending}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 z-10"
                      >
                        <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upload New Photos */}
          {localGallery.length < 10 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">Add New Photos</h4>

              <div className="border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="service-gallery-upload"
                  disabled={uploadMutation.isPending}
                />
                <label
                  htmlFor="service-gallery-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Icon icon={Icons.FiUpload} className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Choose photos to upload
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Select up to {10 - localGallery.length} photos (max 5MB each)
                  </span>
                </label>
              </div>

              {selectedFiles && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Selected {selectedFiles.length} file(s):
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.from(selectedFiles).map((file, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 dark:bg-dark-700 px-2 py-1 rounded text-sm text-gray-700 dark:text-gray-300"
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedFiles(null)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      disabled={uploadMutation.isPending}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploadMutation.isPending}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
                    >
                      {uploadMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Icon icon={Icons.FiUpload} className="w-4 h-4 mr-2" />
                          Upload Photos
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {localGallery.length >= 10 && (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-400">
                Gallery is full (10/10 photos). Delete some photos to add new ones.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceGalleryManager;
