import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, Icons } from '../../components/common/Icons';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  type: 'tour' | 'service' | 'both';
  icon: string;
  color: string;
  status: 'active' | 'inactive';
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  type: 'tour' | 'service' | 'both';
  icon: string;
  color: string;
  status: 'active' | 'inactive';
  featured: boolean;
  sort_order: number;
}

const CategoryManagement: React.FC = () => {
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'tour' | 'service' | 'both'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    type: 'service',
    icon: 'map-pin',
    color: '#3B82F6',
    status: 'active',
    featured: false,
    sort_order: 0,
  });

  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Fetch categories
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['admin-categories', { search: searchTerm, type: typeFilter, status: statusFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`${getApiUrl()}/categories?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const categories: Category[] = categoriesData?.data || [];

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const response = await fetch(`${getApiUrl()}/categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['featured-categories'] });
      toast.success('Category created successfully!');
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create category');
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CategoryFormData }) => {
      const response = await fetch(`${getApiUrl()}/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['featured-categories'] });
      toast.success('Category updated successfully!');
      resetForm();
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update category');
    },
  });

  // Delete category mutation with usage check
  const deleteCategoryMutation = useMutation({
    mutationFn: async ({ id, force }: { id: number; force?: boolean }) => {
      // First check usage unless force delete
      if (!force) {
        const usageResponse = await fetch(`${getApiUrl()}/categories/${id}/usage`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': 'application/json'
          },
        });

        if (usageResponse.ok) {
          const usageData = await usageResponse.json();
          if (!usageData.data.canDelete) {
            const usage = usageData.data;
            const confirmMessage = `This category is currently being used by ${usage.toursUsing} tour(s) and ${usage.servicesUsing} service(s).\n\nDeleting it will require reassigning these items to other categories.\n\nDo you want to force delete anyway?`;

            if (!window.confirm(confirmMessage)) {
              throw new Error('Deletion cancelled by user');
            }

            // If user confirms, proceed with force delete
            force = true;
          }
        }
      }

      const response = await fetch(`${getApiUrl()}/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['featured-categories'] });
      toast.success('Category deleted successfully!');
    },
    onError: (error: any) => {
      if (error.message !== 'Deletion cancelled by user') {
        toast.error(error.message || 'Failed to delete category');
      }
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      type: 'service',
      icon: 'map-pin',
      color: '#3B82F6',
      status: 'active',
      featured: false,
      sort_order: 0,
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      type: category.type,
      icon: category.icon,
      color: category.color,
      status: category.status,
      featured: category.featured,
      sort_order: category.sort_order,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createCategoryMutation.mutate(formData);
    }
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const iconOptions = [
    { value: 'map-pin', label: 'Map Pin', icon: Icons.FiMapPin },
    { value: 'globe', label: 'Globe', icon: Icons.FiGlobe },
    { value: 'plane', label: 'Plane', icon: Icons.FiNavigation },
    { value: 'car', label: 'Car', icon: Icons.FiTruck },
    { value: 'file-text', label: 'File Text', icon: Icons.FiFileText },
    { value: 'truck', label: 'Truck', icon: Icons.FiTruck },
    { value: 'home', label: 'Home', icon: Icons.FiHome },
    { value: 'anchor', label: 'Anchor', icon: Icons.FiAnchor },
    { value: 'navigation', label: 'Navigation', icon: Icons.FiNavigation },
    { value: 'calendar', label: 'Calendar', icon: Icons.FiCalendar },
    { value: 'star', label: 'Star', icon: Icons.FiStar },
    { value: 'users', label: 'Users', icon: Icons.FiUsers },
  ];

  const colorOptions = [
    '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4',
    '#EC4899', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ];

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
              Category Management
            </h1>
            <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
              Manage tour and service categories
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
          >
            <Icon icon={Icons.FiPlus} className="w-5 h-5 mr-2" />
            Add Category
          </button>
        </div>

        {/* Filters */}
        <div className={`p-4 rounded-lg mb-6 ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-sm`}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search categories..."
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode
                    ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                    : 'bg-white border-light-300 text-light-text-primary'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode
                    ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                    : 'bg-white border-light-300 text-light-text-primary'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              >
                <option value="all">All Types</option>
                <option value="tour">Tour</option>
                <option value="service">Service</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  isDarkMode
                    ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                    : 'bg-white border-light-300 text-light-text-primary'
                } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories Table */}
        <div className={`rounded-lg shadow-sm overflow-hidden ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className={`mt-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                Loading categories...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-dark-700' : 'bg-light-50'}`}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      Category
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      Type
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      Featured
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      Sort Order
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-dark-600' : 'divide-light-200'}`}>
                  {categories.map((category) => (
                    <tr key={category.id} className={`hover:${isDarkMode ? 'bg-dark-700' : 'bg-light-50'} transition-colors duration-200`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                            style={{ backgroundColor: category.color }}
                          >
                            <Icon
                              icon={iconOptions.find(opt => opt.value === category.icon)?.icon || Icons.FiMapPin}
                              className="w-5 h-5 text-white"
                            />
                          </div>
                          <div>
                            <div className={`text-sm font-medium ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                              {category.name}
                            </div>
                            <div className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                              {category.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.type === 'tour' 
                            ? 'bg-blue-100 text-blue-800' 
                            : category.type === 'service'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {category.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.featured 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.featured ? 'Featured' : 'Normal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                          {category.sort_order}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(category)}
                          className="text-primary-600 hover:text-primary-900 mr-3 transition-colors duration-200"
                        >
                          <Icon icon={Icons.FiEdit2} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category Form Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className={`p-2 rounded-lg hover:${isDarkMode ? 'bg-dark-700' : 'bg-light-100'} transition-colors duration-200`}
                  >
                    <Icon icon={Icons.FiX} className={`w-6 h-6 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                        Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        required
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                            : 'bg-white border-light-300 text-light-text-primary'
                        } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        placeholder="Category name"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                        required
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                            : 'bg-white border-light-300 text-light-text-primary'
                        } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        placeholder="category-slug"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                          : 'bg-white border-light-300 text-light-text-primary'
                      } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                      placeholder="Category description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                        Type *
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                        required
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                            : 'bg-white border-light-300 text-light-text-primary'
                        } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                      >
                        <option value="tour">Tour</option>
                        <option value="service">Service</option>
                        <option value="both">Both</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                        Status *
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        required
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                            : 'bg-white border-light-300 text-light-text-primary'
                        } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                            : 'bg-white border-light-300 text-light-text-primary'
                        } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                        Icon
                      </label>
                      <select
                        value={formData.icon}
                        onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg ${
                          isDarkMode
                            ? 'bg-dark-700 border-dark-600 text-dark-text-secondary'
                            : 'bg-white border-light-300 text-light-text-primary'
                        } focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                      >
                        {iconOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                        Color
                      </label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                          className="w-12 h-10 border rounded cursor-pointer"
                        />
                        <div className="flex flex-wrap gap-1">
                          {colorOptions.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, color }))}
                              className={`w-6 h-6 rounded border-2 ${formData.color === color ? 'border-gray-900' : 'border-gray-300'}`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="featured" className={`ml-2 text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      Featured in Our Core Services section
                    </label>
                  </div>

                  <div className="flex justify-end space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className={`px-4 py-2 border rounded-lg font-medium transition-colors duration-200 ${
                        isDarkMode
                          ? 'border-dark-600 text-dark-text-muted hover:bg-dark-700'
                          : 'border-light-300 text-light-text-muted hover:bg-light-50'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                    >
                      {(createCategoryMutation.isPending || updateCategoryMutation.isPending)
                        ? 'Saving...'
                        : editingCategory
                          ? 'Update Category'
                          : 'Create Category'
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
