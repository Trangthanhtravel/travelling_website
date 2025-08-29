import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon, Icons } from '../components/common/Icons';
import { useTheme } from '../contexts/ThemeContext';

const Services: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  // Load initial category from URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== 'all') {
      setActiveCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Icon mapping for categories
  const getIconFromString = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'car': Icons.FiTruck,
      'file-text': Icons.FiFileText,
      'truck': Icons.FiTruck,
      'home': Icons.FiHome,
      'globe': Icons.FiGlobe,
      'plane': Icons.FiSend,
      'map-pin': Icons.FiMapPin,
      'package': Icons.FiPackage,
      'users': Icons.FiUsers,
      'calendar': Icons.FiCalendar,
      'default': Icons.FiPackage
    };
    return iconMap[iconName] || iconMap['default'];
  };

  // Fetch service categories from database
  const { data: categoriesData } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/categories?type=service&status=active`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const categories = [
    { id: 'all', name: 'All Services', slug: 'all', icon: Icons.FiGrid },
    ...(categoriesData?.data?.map((cat: any) => ({
      ...cat,
      icon: getIconFromString(cat.icon)
    })) || [])
  ];

  // Fetch services from API with pagination
  const { data: servicesData, isLoading, error } = useQuery({
    queryKey: ['services', { category: activeCategory, search: searchTerm, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') {
        // Use category slug for filtering instead of category_id
        params.append('category', activeCategory);
      }
      if (searchTerm) params.append('search', searchTerm);
      params.append('status', 'active');
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${getApiUrl()}/services?${params}`);
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
    enabled: !!categoriesData, // Only run when categories are loaded
  });

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: 1
    }));
  };

  const pagination = servicesData?.pagination;
  const services = servicesData?.data || [];

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="text-center py-12">
          <Icon icon={Icons.FiAlertCircle} className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error loading services</h3>
          <p className="text-gray-600 dark:text-gray-400">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="bg-accent-orange text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Travel Services</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Comprehensive travel solutions for all your adventure needs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className={`rounded-lg shadow-lg p-6 mb-8 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                Search Services
              </label>
              <div className="relative">
                <Icon icon={Icons.FiSearch} className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                View Mode
              </label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-accent-orange text-white'
                      : isDarkMode
                      ? 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon icon={Icons.FiGrid} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-accent-orange text-white'
                      : isDarkMode
                      ? 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon icon={Icons.FiList} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.slug || category.id)}
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                activeCategory === (category.slug || category.id)
                  ? 'bg-accent-orange text-white'
                  : isDarkMode
                  ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700 border border-dark-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Icon icon={category.icon} className="w-4 h-4 mr-2" />
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className={`rounded-xl shadow-lg animate-pulse ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
                <div className={`h-48 rounded-t-xl ${isDarkMode ? 'bg-dark-700' : 'bg-gray-200'}`}></div>
                <div className="p-6">
                  <div className={`h-4 rounded mb-2 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-6 rounded mb-4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-200'}`}></div>
                  <div className={`h-4 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Services Grid/List */}
        {!isLoading && services.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {services.map((service: any) => (
              <div
                key={service.id}
                className={`group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'
                } ${viewMode === 'grid' ? 'rounded-xl' : 'rounded-lg flex flex-col sm:flex-row'}`}
              >
                <div className={`relative overflow-hidden ${
                  viewMode === 'grid' ? 'h-48' : 'h-48 sm:h-auto sm:w-64 flex-shrink-0'
                }`}>
                  <img
                    src={service.images?.[0] || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-accent-orange text-white rounded-full px-3 py-1 text-sm font-medium">
                    ${service.price}
                  </div>
                  {service.featured && (
                    <div className="absolute top-4 left-4 bg-warning text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className={`flex items-center text-sm mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                    <Icon icon={Icons.FiTag} className="w-4 h-4 mr-1" />
                    <span className="capitalize">
                      {service.category ?
                        (typeof service.category === 'string' ?
                          service.category.replace('-', ' ') :
                          service.category.name || service.category.slug || 'Uncategorized'
                        ) :
                        'Uncategorized'
                      }
                    </span>
                  </div>
                  <h3 className={`font-bold mb-2 group-hover:text-accent-orange transition-colors duration-200 ${
                    viewMode === 'grid' ? 'text-xl' : 'text-lg'
                  } ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
                    {service.title}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-2 flex-grow ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                    {service.description}
                  </p>

                  {service.duration && (
                    <div className={`flex items-center text-sm mb-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                      <Icon icon={Icons.FiClock} className="w-4 h-4 mr-1" />
                      <span>{service.duration}</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Link
                    to={`/services/${service.slug}`}
                    className="w-full bg-accent-orange hover:bg-accent-orange-hover text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && services.length > 0 && pagination && (
          <div className="mt-8">
            <div className={`flex justify-between items-center mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
              <div className="text-sm">
                Showing {pagination.total > 0 ? (pagination.currentPage - 1) * pagination.limit + 1 : 0} -{' '}
                {pagination.currentPage * pagination.limit > pagination.total ? pagination.total : pagination.currentPage * pagination.limit}{' '}
                of {pagination.total} services
              </div>

              {/* Sort By */}
              <div>
                <label className="sr-only">Sort by</label>
                <select
                  onChange={(e) => handleSortChange(e.target.value)}
                  className={`block appearance-none bg-transparent border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:border-dark-600 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}
                >
                  <option value="created_at-desc">Newest First</option>
                  <option value="created_at-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors mr-2 ${isDarkMode ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Icon icon={Icons.FiChevronLeft} className="w-4 h-4 mr-2" />
                Previous
              </button>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage * pagination.limit >= pagination.total}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isDarkMode ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Next
                <Icon icon={Icons.FiChevronRight} className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && services.length === 0 && (
          <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}`}>
            <Icon icon={Icons.FiPackage} className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-400'}`} />
            <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
              No services found
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
              Try adjusting your search or category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
