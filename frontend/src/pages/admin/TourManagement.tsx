import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
import TourModal from '../../components/admin/TourModal';
import GalleryManager from '../../components/common/GalleryManager';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../utils/currency';

// Tour types (updated to include Vietnamese fields)
interface Tour {
  id: number;
  title: string;
  title_vi?: string;
  slug?: string;
  description: string;
  description_vi?: string;
  price: number;
  duration: string;
  duration_vi?: string;
  location: string;
  location_vi?: string;
  max_participants: number;
  category: string;
  image: string;
  itinerary: any;
  itinerary_vi?: any;
  included: string[];
  included_vi?: string[];
  excluded: string[];
  excluded_vi?: string[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  created_at: string;
  updated_at: string;
}


const TourManagement: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryTour, setGalleryTour] = useState<Tour | null>(null);

  const queryClient = useQueryClient();

  // Get the correct API base URL
  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Fetch tours - use public tours endpoint with admin auth
  const { data: toursData, isLoading } = useQuery({
    queryKey: ['admin-tours', searchTerm, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`${getApiUrl()}/tours?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tours');
      return response.json();
    }
  });

  // Fetch categories for tours
  const { data: categoriesData } = useQuery({
    queryKey: ['tour-categories'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/categories?type=tour`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Create tour mutation with proper FormData for image upload
  const createTourMutation = useMutation({
    mutationFn: async (tourData: any) => {
      const formData = new FormData();

      // Add all tour fields
      formData.append('title', tourData.title.en);
      formData.append('title_vi', tourData.title.vi);
      formData.append('description', tourData.description.en);
      formData.append('description_vi', tourData.description.vi);
      formData.append('price', tourData.price.toString());
      formData.append('duration', tourData.duration.en);
      formData.append('duration_vi', tourData.duration.vi);
      formData.append('location', tourData.location.en);
      formData.append('location_vi', tourData.location.vi);
      formData.append('max_participants', tourData.max_participants.toString());
      formData.append('category_slug', tourData.category); // Fix: use category_slug
      formData.append('included', JSON.stringify(tourData.included));
      formData.append('excluded', JSON.stringify(tourData.excluded));
      formData.append('status', tourData.status);
      formData.append('featured', tourData.featured.toString());

      // Add image if provided
      if (tourData.image) {
        formData.append('image', tourData.image);
      }

      const response = await fetch(`${getApiUrl()}/tours`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create tour');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success('Tour created successfully');
      setIsCreateModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create tour');
    }
  });

  // Update tour mutation with proper FormData handling
  const updateTourMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const formData = new FormData();

      // Add all tour fields
      formData.append('title', data.title.en);
      formData.append('title_vi', data.title.vi);
      formData.append('description', data.description.en);
      formData.append('description_vi', data.description.vi);
      formData.append('price', data.price.toString());
      formData.append('duration', data.duration.en);
      formData.append('duration_vi', data.duration.vi);
      formData.append('location', data.location.en);
      formData.append('location_vi', data.location.vi);
      formData.append('max_participants', data.max_participants.toString());
      formData.append('category_slug', data.category); // Fix: use category_slug
      formData.append('included', JSON.stringify(data.included));
      formData.append('excluded', JSON.stringify(data.excluded));
      formData.append('status', data.status);
      formData.append('featured', data.featured.toString());

      // Add new image if provided
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await fetch(`${getApiUrl()}/tours/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update tour');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success('Tour updated successfully');
      setIsEditModalOpen(false);
      setSelectedTour(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update tour');
    }
  });

  // Delete tour mutation
  const deleteTourMutation = useMutation({
    mutationFn: async (tourId: number) => {
      const response = await fetch(`${getApiUrl()}/tours/${tourId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete tour');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
      toast.success('Tour deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete tour');
    }
  });

  const handleEditTour = (tour: Tour) => {
    setSelectedTour(tour);
    setIsEditModalOpen(true);
  };

  const handleDeleteTour = (tour: Tour) => {
    if (window.confirm(`Are you sure you want to delete "${tour.title}"? This action cannot be undone.`)) {
      deleteTourMutation.mutate(tour.id);
    }
  };

  const handleOpenGallery = (tour: Tour) => {
    setGalleryTour(tour);
    setIsGalleryModalOpen(true);
  };

  const tours = toursData?.data || [];
  const filteredTours = tours.filter((tour: Tour) => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tour.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || tour.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tour Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage your tours</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 sm:mt-0 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
        >
          <Icon icon={Icons.FiPlus} className="w-5 h-5 mr-2" />
          Create Tour
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border dark:border-dark-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Icon icon={Icons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tours Grid */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border dark:border-dark-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading tours...</p>
          </div>
        ) : filteredTours.length === 0 ? (
          <div className="p-8 text-center">
            <Icon icon={Icons.FiCalendar} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tours found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first tour'
              }
            </p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTours.map((tour: Tour) => (
                <div key={tour.id} className="bg-white dark:bg-dark-700 rounded-lg border dark:border-dark-600 shadow-sm hover:shadow-md transition-shadow duration-200">
                  {/* Tour Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      className="w-full h-full object-cover"
                      src={tour.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                      alt={tour.title}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    {/* Status and Featured badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tour.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      }`}>
                        {tour.status}
                      </span>
                      {tour.featured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                    {/* Price */}
                    <div className="absolute top-3 right-3 bg-white dark:bg-dark-800 rounded-lg px-2 py-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(tour.price)}
                      </span>
                    </div>
                  </div>

                  {/* Tour Details */}
                  <div className="p-4">
                    {/* Title and Location */}
                    <div className="mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate" title={tour.title}>
                        {tour.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Icon icon={Icons.FiMapPin} className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate" title={tour.location}>{tour.location}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2" title={tour.description}>
                      {tour.description}
                    </p>

                    {/* Duration and Participants */}
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center">
                        <Icon icon={Icons.FiClock} className="w-4 h-4 mr-1" />
                        <span className="truncate" title={tour.duration}>{tour.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <Icon icon={Icons.FiUsers} className="w-4 h-4 mr-1" />
                        <span>Max {tour.max_participants}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end space-x-2 pt-3 border-t dark:border-dark-600">
                      <button
                        onClick={() => handleEditTour(tour)}
                        className="p-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200"
                        title="Edit tour"
                      >
                        <Icon icon={Icons.FiEdit3} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenGallery(tour)}
                        className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                        title="Manage gallery"
                      >
                        <Icon icon={Icons.FiImage} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour)}
                        className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                        title="Delete tour"
                      >
                        <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Tour Modal */}
      {isCreateModalOpen && (
        <TourModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => createTourMutation.mutate(data)}
          isLoading={createTourMutation.isPending}
          title="Create New Tour"
          categories={categoriesData?.data || []}
        />
      )}

      {/* Edit Tour Modal */}
      {isEditModalOpen && selectedTour && (
        <TourModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTour(null);
          }}
          onSubmit={(data) => updateTourMutation.mutate({ id: selectedTour.id, data })}
          isLoading={updateTourMutation.isPending}
          title="Edit Tour"
          initialData={selectedTour}
          categories={categoriesData?.data || []}
        />
      )}

      {/* Gallery Manager Modal */}
      {isGalleryModalOpen && galleryTour && (
        <GalleryManager
          isOpen={isGalleryModalOpen}
          onClose={() => {
            setIsGalleryModalOpen(false);
            setGalleryTour(null);
          }}
          tour={galleryTour}
          onUpdateSuccess={(updatedTour) => {
            // Update the local state immediately
            setGalleryTour(updatedTour);

            // Update the cached query data for the tours list
            queryClient.setQueryData(['admin-tours', searchTerm, filterStatus], (oldData: any) => {
              if (!oldData) return oldData;

              return {
                ...oldData,
                data: oldData.data.map((tour: Tour) =>
                  tour.id === updatedTour.id ? updatedTour : tour
                )
              };
            });

            // Also update individual tour cache if it exists
            queryClient.setQueryData(['admin-tour', updatedTour.id], updatedTour);

            // Don't show additional success message here - GalleryManager already shows one
          }}
          onDeleteSuccess={() => {
            // Invalidate and refetch tours data
            queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
            // Don't show additional success message here - GalleryManager already shows one
          }}
        />
      )}
    </div>
  );
};

export default TourManagement;
