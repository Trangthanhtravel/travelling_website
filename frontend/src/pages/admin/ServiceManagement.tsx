import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
import ServiceGalleryManager from '../../components/common/ServiceGalleryManager';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  type: string;
  icon?: string;
  color?: string;
}

interface Service {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    price: number;
    duration?: string;
    category_id?: string;
    category?: Category;
    service_type?: string;
    images: string[];
    videos?: string[];
    included: string[];
    excluded: string[];
    itinerary?: string[];
    location?: any;
    featured: boolean;
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

const ServiceManagement: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryService, setGalleryService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Fetch categories for filter and form
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/categories?type=service`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const categories = categoriesData?.data || [];

  // Fetch services
  const { data: servicesData, isLoading, error } = useQuery({
    queryKey: ['admin-services', searchTerm, filterCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory !== 'all') params.append('category', filterCategory);

      const response = await fetch(`${getApiUrl()}/services?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await fetch(`${getApiUrl()}/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to delete service');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete service');
    }
  });

  // Toggle service status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ serviceId, status }: { serviceId: string; status: 'active' | 'inactive' }) => {
      const response = await fetch(`${getApiUrl()}/admin/services/${serviceId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update service status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update service status');
    }
  });

  const services: Service[] = servicesData?.data || [];

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDelete = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  const handleStatusToggle = (serviceId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toggleStatusMutation.mutate({ serviceId, status: newStatus });
  };

  // Create filter options from actual categories
  const filterOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((cat: Category) => ({
      value: cat.slug,
      label: cat.name
    }))
  ];

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon icon={Icons.FiAlertCircle} className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error loading services</h3>
        <p className="text-gray-600 dark:text-gray-400">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Service Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage your travel services</p>
        </div>
        <button
          onClick={() => {
            setEditingService(null);
            setIsModalOpen(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
        >
          <Icon icon={Icons.FiPlus} className="w-5 h-5 mr-2" />
          Add Service
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg border dark:border-dark-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Services
            </label>
            <div className="relative">
              <Icon icon={Icons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg border dark:border-dark-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <Icon icon={Icons.FiLoader} className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="p-8 text-center">
            <Icon icon={Icons.FiPackage} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Get started by creating your first service</p>
            <button
              onClick={() => {
                setEditingService(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              <Icon icon={Icons.FiPlus} className="w-5 h-5 mr-2" />
              Add Service
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {service.images && service.images.length > 0 ? (
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                            <Icon icon={Icons.FiImage} className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {service.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                        {service.category?.name || 'No Category'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      ${service.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleStatusToggle(service.id, service.status)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors duration-200 ${
                          service.status === 'active'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/30'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30'
                        }`}
                      >
                        {service.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(service.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Icon icon={Icons.FiEdit} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setGalleryService(service);
                            setIsGalleryModalOpen(true);
                          }}
                          className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
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

      {/* Service Modal */}
      {isModalOpen && (
        <ServiceModal
          service={editingService}
          categories={categories}
          onClose={() => {
            setIsModalOpen(false);
            setEditingService(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
            setIsModalOpen(false);
            setEditingService(null);
          }}
        />
      )}

      {/* Service Gallery Manager Modal */}
      {isGalleryModalOpen && galleryService && (
        <ServiceGalleryManager
          service={galleryService}
          onClose={() => {
            setIsGalleryModalOpen(false);
            setGalleryService(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['admin-services'] });
            setIsGalleryModalOpen(false);
            setGalleryService(null);
          }}
        />
      )}
    </div>
  );
};

// Service Modal Component
interface ServiceModalProps {
  service: Service | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category_id: string;
    price: number;
    itinerary: string[];
    status: "active" | "inactive";
    duration: string;
    images: string[];
  }>({
    title: service?.title || '',
    description: service?.description || '',
    category_id: service?.category_id || (categories.length > 0 ? categories[0].id : ''),
    price: service?.price || 0,
    itinerary: service?.itinerary || [''],
    status: service?.status || 'active',
    duration: service?.duration || '',
    images: service?.images || []
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    setUploading(true);
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`${getApiUrl()}/admin/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload images');
      const result = await response.json();
      return result.data?.urls || [];
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
      return [];
    } finally {
      setUploading(false);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      let imageUrls = formData.images;

      // Upload new images if any
      if (selectedFiles.length > 0) {
        const newImageUrls = await uploadImages(selectedFiles);
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      const serviceData = {
        title: data.title,
        description: data.description,
        category_id: data.category_id,
        price: data.price,
        duration: data.duration,
        status: data.status,
        images: JSON.stringify(imageUrls),
        itinerary: JSON.stringify(data.itinerary.filter((item: string) => item.trim() !== '')),
        included: JSON.stringify(data.itinerary.filter((item: string) => item.trim() !== '')),
        excluded: JSON.stringify([]),
        featured: false
      };

      const url = service
        ? `${getApiUrl()}/services/admin/services/${service.id}`
        : `${getApiUrl()}/services/admin/services`;

      const response = await fetch(url, {
        method: service ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(serviceData)
      });

      if (!response.ok) throw new Error('Failed to save service');
      return response.json();
    },
    onSuccess: () => {
      toast.success(service ? 'Service updated successfully' : 'Service created successfully');
      onSuccess();
    },
    onError: (error) => {
      console.error('Error saving service:', error);
      toast.error(service ? 'Failed to update service' : 'Failed to create service');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, '']
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-2xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-dark-800 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between p-6 border-b dark:border-dark-700">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              {service ? 'Edit Service' : 'Create Service'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <Icon icon={Icons.FiX} className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Service Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service Name *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                placeholder="Enter service name"
              />
            </div>

            {/* Service Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                placeholder="Enter service description"
              />
            </div>

            {/* Category and Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Duration and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                  placeholder="e.g., 2 hours, 1 day"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status *
                </label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Current Images */}
            {formData.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Images
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {formData.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Service ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border border-gray-200 dark:border-dark-600"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon icon={Icons.FiX} className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Service Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setSelectedFiles(files);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload up to 10 images (JPG, PNG, WebP - Max 5MB each)
              </p>
              {selectedFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Selected files: {selectedFiles.map(f => f.name).join(', ')}
                  </p>
                </div>
              )}
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Features/Included Services
              </label>
              {formData.itinerary.map((itinerary, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={itinerary}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                    placeholder="Enter a feature or included service"
                  />
                  {formData.itinerary.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Icon icon={Icons.FiMinus} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
              >
                <Icon icon={Icons.FiPlus} className="w-4 h-4 mr-1" />
                Add Feature
              </button>
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
                disabled={mutation.isPending || uploading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending || uploading ? (
                  <div className="flex items-center">
                    <Icon icon={Icons.FiLoader} className="animate-spin w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : (service ? 'Updating...' : 'Creating...')}
                  </div>
                ) : (
                  service ? 'Update Service' : 'Create Service'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceManagement;
