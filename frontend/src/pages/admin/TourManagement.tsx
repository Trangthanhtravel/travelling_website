import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
import GalleryManager from '../../components/common/GalleryManager';
import toast from 'react-hot-toast';

// Tour types (corrected to match backend)
interface Tour {
  id: number;
  title: string;
  slug?: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  max_participants: number;
  tour_type: string; // Fixed: use appropriate travel field
  activity_level: string; // Fixed: use activity level instead of difficulty
  category: string;
  images: string[];
  itinerary: any;
  included: string[];
  excluded: string[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  created_at: string;
  updated_at: string;
}

interface TourFormData {
  title: string;
  description: string;
  price: number;
  duration: string;
  location: string;
  max_participants: number;
  tour_type: string; // Fixed field name
  activity_level: string; // Fixed field name
  category: string;
  included: string[];
  excluded: string[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  images?: FileList;
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

  // Create tour mutation with proper FormData for image upload
  const createTourMutation = useMutation({
    mutationFn: async (tourData: TourFormData) => {
      const formData = new FormData();

      // Add all tour fields
      formData.append('title', tourData.title);
      formData.append('description', tourData.description);
      formData.append('price', tourData.price.toString());
      formData.append('duration', tourData.duration);
      formData.append('location', tourData.location);
      formData.append('max_participants', tourData.max_participants.toString());
      formData.append('tour_type', tourData.tour_type); // Fixed field name
      formData.append('activity_level', tourData.activity_level); // Fixed field name
      formData.append('category', tourData.category);
      formData.append('included', JSON.stringify(tourData.included));
      formData.append('excluded', JSON.stringify(tourData.excluded));
      formData.append('status', tourData.status);
      formData.append('featured', tourData.featured.toString());

      // Add images if provided
      if (tourData.images && tourData.images.length > 0) {
        Array.from(tourData.images).forEach((file) => {
          formData.append('images', file);
        });
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
    mutationFn: async ({ id, data }: { id: number; data: TourFormData }) => {
      const formData = new FormData();

      // Add all tour fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('duration', data.duration);
      formData.append('location', data.location);
      formData.append('max_participants', data.max_participants.toString());
      formData.append('tour_type', data.tour_type); // Fixed field name
      formData.append('activity_level', data.activity_level); // Fixed field name
      formData.append('category', data.category);
      formData.append('included', JSON.stringify(data.included));
      formData.append('excluded', JSON.stringify(data.excluded));
      formData.append('status', data.status);
      formData.append('featured', data.featured.toString());

      // Add new images if provided
      if (data.images && data.images.length > 0) {
        Array.from(data.images).forEach((file) => {
          formData.append('images', file);
        });
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

  const handleDeleteTour = (tour: Tour) => {
    if (window.confirm(`Are you sure you want to delete "${tour.title}"? This action cannot be undone.`)) {
      deleteTourMutation.mutate(tour.id);
    }
  };

  const handleEditTour = (tour: Tour) => {
    setSelectedTour(tour);
    setIsEditModalOpen(true);
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

      {/* Tours Table */}
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
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tour
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
                {filteredTours.map((tour: Tour) => (
                  <tr key={tour.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={tour.images[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                            alt={tour.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {tour.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                            {tour.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{tour.location}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{tour.activity_level}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${tour.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{tour.duration}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Max {tour.max_participants} people
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditTour(tour)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Icon icon={Icons.FiEdit3} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTour(tour)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenGallery(tour)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Icon icon={Icons.FiImage} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
            queryClient.setQueryData(['admin-tours', selectedTour?.id], updatedTour);
            toast.success('Gallery updated successfully');
          }}
          onDeleteSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-tours'] });
            toast.success('Tour deleted successfully');
          }}
        />
      )}
    </div>
  );
};

// Tour Modal Component
interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  title: string;
  initialData?: Tour;
}

const TourModal: React.FC<TourModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  title,
  initialData
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    duration: initialData?.duration || '',
    location: initialData?.location || '',
    max_participants: initialData?.max_participants || 1,
    tour_type: initialData?.tour_type || '', // Fixed field name
    activity_level: initialData?.activity_level || 'easy', // Fixed field name
    category: initialData?.category || '',
    included: initialData?.included || [],
    excluded: initialData?.excluded || [],
    status: initialData?.status || 'active',
    featured: initialData?.featured || false, // Initialize featured field
    images: undefined // Initialize images as undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormData({ ...formData, images: files });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 5 days"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Participants
                </label>
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: Number(e.target.value) })}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tour Type
                </label>
                <input
                  type="text"
                  value={formData.tour_type}
                  onChange={(e) => setFormData({ ...formData, tour_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Activity Level
                </label>
                <select
                  value={formData.activity_level}
                  onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' | 'draft' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                required
              >
                <option value="">Select Category</option>
                <option value="adventure">Adventure</option>
                <option value="cultural">Cultural</option>
                <option value="nature">Nature</option>
                <option value="city">City</option>
                <option value="beach">Beach</option>
                <option value="luxury">Luxury</option>
                <option value="family">Family</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Images
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-primary-50 file:text-primary-700"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select multiple images for your tour. Max 10 images, 5MB each.
              </p>
              {initialData?.images && initialData.images.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Current images: {initialData.images.length} uploaded
                  </p>
                </div>
              )}
            </div>

            {/* Featured Tour Toggle */}
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
              />
              <label className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Featured Tour
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                {initialData ? 'Update' : 'Create'} Tour
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TourManagement;
