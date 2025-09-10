import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
import ServiceModal from '../../components/admin/ServiceModal';
import ServiceGalleryManager from '../../components/common/ServiceGalleryManager';
import { useTranslation } from '../../contexts/TranslationContext';
import { useTheme } from '../../contexts/ThemeContext';
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
  image: string | null;
  gallery?: string[];
  included: string[];
  excluded: string[];
  itinerary?: string[];
  location?: any;
  featured: boolean;
  status: 'active' | 'inactive';
  // Vietnamese fields
  title_vi?: string;
  subtitle_vi?: string;
  description_vi?: string;
  duration_vi?: string;
  included_vi?: string[];
  excluded_vi?: string[];
  created_at: string;
  updated_at: string;
}

const ServiceManagement: React.FC = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [galleryService, setGalleryService] = useState<Service | null>(null);
  const queryClient = useQueryClient();

  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Fetch categories for filter and form
  const { data: categoriesData } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/categories?type=service`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
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
    queryKey: ['admin-services', searchTerm, filterCategory, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterStatus !== 'all') params.append('status', filterStatus);

      const response = await fetch(`${getApiUrl()}/services?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: any) => {
      const formData = new FormData();

      // Add all service fields (English)
      formData.append('title', serviceData.title.en);
      formData.append('description', serviceData.description.en);
      formData.append('price', serviceData.price.toString());
      formData.append('category_id', serviceData.category_id);
      formData.append('status', serviceData.status);
      formData.append('featured', serviceData.featured.toString());

      if (serviceData.duration?.en) formData.append('duration', serviceData.duration.en);
      if (serviceData.subtitle?.en) formData.append('subtitle', serviceData.subtitle.en);

      // Add Vietnamese fields
      if (serviceData.title.vi) formData.append('title_vi', serviceData.title.vi);
      if (serviceData.description.vi) formData.append('description_vi', serviceData.description.vi);
      if (serviceData.duration?.vi) formData.append('duration_vi', serviceData.duration.vi);
      if (serviceData.subtitle?.vi) formData.append('subtitle_vi', serviceData.subtitle.vi);

      // Add included/excluded as JSON
      formData.append('included', JSON.stringify(serviceData.included || []));
      formData.append('excluded', JSON.stringify(serviceData.excluded || []));
      if (serviceData.included_vi) formData.append('included_vi', JSON.stringify(serviceData.included_vi));
      if (serviceData.excluded_vi) formData.append('excluded_vi', JSON.stringify(serviceData.excluded_vi));

      // Add image if provided
      if (serviceData.image) {
        formData.append('image', serviceData.image);
      }

      const response = await fetch(`${getApiUrl()}/services/admin/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create service');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully');
      setIsCreateModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create service');
    }
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const formData = new FormData();

      // Add all service fields (English)
      formData.append('title', data.title.en);
      formData.append('description', data.description.en);
      formData.append('price', data.price.toString());
      formData.append('category_id', data.category_id);
      formData.append('status', data.status);
      formData.append('featured', data.featured.toString());

      if (data.duration?.en) formData.append('duration', data.duration.en);
      if (data.subtitle?.en) formData.append('subtitle', data.subtitle.en);

      // Add Vietnamese fields
      if (data.title.vi) formData.append('title_vi', data.title.vi);
      if (data.description.vi) formData.append('description_vi', data.description.vi);
      if (data.duration?.vi) formData.append('duration_vi', data.duration.vi);
      if (data.subtitle?.vi) formData.append('subtitle_vi', data.subtitle.vi);

      // Add included/excluded as JSON
      formData.append('included', JSON.stringify(data.included || []));
      formData.append('excluded', JSON.stringify(data.excluded || []));
      if (data.included_vi) formData.append('included_vi', JSON.stringify(data.included_vi));
      if (data.excluded_vi) formData.append('excluded_vi', JSON.stringify(data.excluded_vi));

      // Add new image if provided
      if (data.image) {
        formData.append('image', data.image);
      }

      const response = await fetch(`${getApiUrl()}/services/admin/services/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update service');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service'] });
      toast.success('Service updated successfully');
      setIsEditModalOpen(false);
      setSelectedService(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update service');
    }
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      const response = await fetch(`${getApiUrl()}/services/admin/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete service');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete service');
    }
  });

  const handleEditService = (service: Service) => {
    setSelectedService(service);
    setIsEditModalOpen(true);
  };

  const handleDeleteService = (service: Service) => {
    if (window.confirm(`Are you sure you want to delete "${service.title}"? This action cannot be undone.`)) {
      deleteServiceMutation.mutate(service.id);
    }
  };

  const handleOpenGallery = (service: Service) => {
    setGalleryService(service);
    setIsGalleryModalOpen(true);
  };

  const services: Service[] = servicesData?.data || [];
  const filteredServices = services.filter((service: Service) => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category_id === filterCategory;
    const matchesStatus = filterStatus === 'all' || service.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Create filter options from actual categories
  const filterOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map((cat: Category) => ({
      value: cat.id,
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
          <p className="text-gray-600 dark:text-gray-400">Create and manage your travel services</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 sm:mt-0 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
        >
          <Icon icon={Icons.FiPlus} className="w-5 h-5 mr-2" />
          Create Service
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
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

      {/* Services Table */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border dark:border-dark-700 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-8 text-center">
            <Icon icon={Icons.FiPackage} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No services found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm || filterCategory !== 'all' || filterStatus !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first service'
              }
            </p>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
                {filteredServices.map((service: Service) => (
                  <tr key={service.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 flex-shrink-0">
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={service.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}
                            alt={service.title}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {service.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${service.price}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          service.status === 'active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                        }`}>
                          {service.status}
                        </span>
                        {service.featured && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditService(service)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <Icon icon={Icons.FiEdit3} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenGallery(service)}
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

      {/* Create Service Modal */}
      {isCreateModalOpen && (
        <ServiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => createServiceMutation.mutate(data)}
          isLoading={createServiceMutation.isPending}
          title="Create New Service"
          categories={categories}
        />
      )}

      {/* Edit Service Modal */}
      {isEditModalOpen && selectedService && (
        <ServiceModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedService(null);
          }}
          onSubmit={(data) => updateServiceMutation.mutate({ id: selectedService.id, data })}
          isLoading={updateServiceMutation.isPending}
          title="Edit Service"
          initialData={selectedService}
          categories={categories}
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
            queryClient.invalidateQueries({ queryKey: ['services'] });
            queryClient.invalidateQueries({ queryKey: ['service'] });
          }}
        />
      )}
    </div>
  );
};

export default ServiceManagement;
