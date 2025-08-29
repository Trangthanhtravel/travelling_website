import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Icons } from './Icons';
import toast from 'react-hot-toast';

interface GalleryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  tour: {
    id: number;
    title: string;
    gallery?: string[];
  };
  onUpdateSuccess: (updatedTour: any) => void;
  onDeleteSuccess: () => void;
}

const GalleryManager: React.FC<GalleryManagerProps> = ({
  onClose,
  tour
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const queryClient = useQueryClient();

  // API functions
  const updateGallery = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/tours/${tour.id}/gallery`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update gallery');
    }

    return response.json();
  };

  const deleteGalleryPhoto = async (photoUrl: string) => {
    const encodedUrl = encodeURIComponent(photoUrl);
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/tours/${tour.id}/gallery/${encodedUrl}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
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
    onSuccess: () => {
      toast.success('Gallery updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      setSelectedFiles(null);
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update gallery');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGalleryPhoto,
    onSuccess: () => {
      toast.success('Photo deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
    },
    onError: (error: any) => {
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

    if (tour.gallery && tour.gallery.length + selectedFiles.length > 10) {
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Manage Photo Gallery</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Icon icon={Icons.FiX} className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Upload up to 10 high-quality photos for the tour gallery
          </p>
        </div>

        <div className="p-6">
          {/* Current Gallery */}
          {tour.gallery && tour.gallery.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Current Gallery ({tour.gallery.length}/10)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tour.gallery.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeletePhoto(photo)}
                      disabled={deleteMutation.isPending}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload New Photos */}
          {tour.gallery && tour.gallery.length < 10 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Add New Photos</h4>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="gallery-upload"
                  disabled={uploadMutation.isPending}
                />
                <label
                  htmlFor="gallery-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Icon icon={Icons.FiUpload} className="w-12 h-12 text-gray-400 mb-4" />
                  <span className="text-lg font-medium text-gray-900 mb-2">
                    Choose photos to upload
                  </span>
                  <span className="text-sm text-gray-600">
                    Select up to {10 - (tour.gallery.length)} photos (max 5MB each)
                  </span>
                </label>
              </div>

              {selectedFiles && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Selected {selectedFiles.length} file(s):
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Array.from(selectedFiles).map((file, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-700"
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedFiles(null)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
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

          {tour.gallery && tour.gallery.length >= 10 && (
            <div className="text-center py-4">
              <p className="text-gray-600">
                Gallery is full (10/10 photos). Delete some photos to add new ones.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GalleryManager;
