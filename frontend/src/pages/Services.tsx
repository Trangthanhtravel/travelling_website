import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon, Icons } from '../components/common/Icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';
import LottieLoading from '../components/common/LottieLoading';
import { formatCurrency } from '../utils/currency';

const Services: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t, language, getLocalizedContent } = useTranslation();
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

  // Fetch service categories from database with language support
  const { data: categoriesData } = useQuery({
    queryKey: ['service-categories', language],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/categories?type=service&status=active&language=${language}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const categories = [
    { id: 'all', name: t('Our Services'), slug: 'all', icon: Icons.FiGrid },
    ...(categoriesData?.data?.map((cat: any) => ({
      ...cat,
      name: getLocalizedContent(cat, 'name') || cat.name,
      icon: getIconFromString(cat.icon)
    })) || [])
  ];

  // Fetch services from API with pagination and language support
  const { data: servicesData, isLoading, error } = useQuery({
    queryKey: ['services', { category: activeCategory, search: searchTerm, language, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') {
        // Use category slug for filtering instead of category_id
        params.append('category', activeCategory);
      }
      if (searchTerm) params.append('search', searchTerm);
      params.append('status', 'active');
      // Exclude car rental services
      params.append('exclude_service_type', 'car-rental');
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);
      params.append('language', language);

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
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('Error loading services')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('Please try again later')}</p>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('Other travel services')}</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t('In addition to our tours and car rental services, we also offer a variety of other services to ensure your trip is seamless and unforgettable.')}
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
                {t('Search')} {t('Services')}
              </label>
              <div className="relative">
                <Icon icon={Icons.FiSearch} className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder={t('Search services...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                    isDarkMode
                      ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400'
                      : 'border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                {t('Sort By')}
              </label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className={`w-full p-3 border rounded-lg ${
                  isDarkMode
                    ? 'bg-dark-700 border-dark-600 text-white'
                    : 'border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
              >
                <option value="created_at-desc">{t('Latest First')}</option>
                <option value="created_at-asc">{t('Oldest First')}</option>
                <option value="title-asc">{t('Title A-Z')}</option>
                <option value="title-desc">{t('Title Z-A')}</option>
                <option value="price-asc">{t('Price Low to High')}</option>
                <option value="price-desc">{t('Price High to Low')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 mb-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.slug)}
                className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeCategory === category.slug
                    ? 'bg-accent-orange text-white'
                    : isDarkMode
                    ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700 border border-dark-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                <Icon icon={category.icon} className="w-4 h-4 mr-2" />
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center mb-6">
          <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
            {pagination?.total || 0} {t('services found')}
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${
                viewMode === 'grid'
                  ? 'bg-accent-orange text-white'
                  : isDarkMode
                  ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Icon icon={Icons.FiGrid} className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${
                viewMode === 'list'
                  ? 'bg-accent-orange text-white'
                  : isDarkMode
                  ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              <Icon icon={Icons.FiList} className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Services Grid/List */}
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <LottieLoading message={t('Loading our services...')} />
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <Icon icon={Icons.FiPackage} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('No services found')}
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('Try adjusting your search or filters.')}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service: any) => (
              <div
                key={service.id}
                className={`rounded-lg shadow-lg overflow-hidden transition-transform duration-200 hover:scale-105 ${
                  isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'
                }`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                    alt={getLocalizedContent(service, 'title') || service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  {service.price && (
                    <div className="absolute top-4 right-4 bg-accent-orange text-white px-3 py-1 rounded-full text-sm font-medium">
                      {formatCurrency(service.price)}
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isDarkMode ? 'bg-dark-700 text-dark-text-muted' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getLocalizedContent(service.category, 'name') || service.category?.name || t('Service')}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 line-clamp-2 h-14 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getLocalizedContent(service, 'title') || service.title}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-2 h-10 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getLocalizedContent(service, 'subtitle') || service.subtitle ||
                     getLocalizedContent(service, 'description') || service.description}
                  </p>
                  <div className="flex space-x-2 mt-auto">
                    <Link
                      to={`/services/${service.slug}`}
                      className="w-full bg-accent-orange hover:bg-accent-orange-dark text-white py-2 px-4 rounded-lg text-center text-sm font-medium transition-colors duration-200"
                    >
                      {t('View Details')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List view
          <div className="space-y-6">
            {services.map((service: any) => (
              <div
                key={service.id}
                className={`rounded-lg shadow-lg overflow-hidden ${
                  isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'
                }`}
              >
                <div className="md:flex">
                  <div className="md:w-1/3">
                    <img
                      src={service.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                      alt={getLocalizedContent(service, 'title') || service.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isDarkMode ? 'bg-dark-700 text-dark-text-muted' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getLocalizedContent(service.category, 'name') || service.category?.name || t('Service')}
                      </span>
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getLocalizedContent(service, 'title') || service.title}
                    </h3>
                    <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {getLocalizedContent(service, 'subtitle') || service.subtitle ||
                       getLocalizedContent(service, 'description') || service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Link
                          to={`/services/${service.slug}`}
                          className="bg-accent-orange hover:bg-accent-orange-dark text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
                        >
                          {t('View Details')}
                        </Link>
                      </div>
                      {service.price && (
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(service.price)}
                          </span>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {t('per service')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  pagination.currentPage === 1
                    ? 'cursor-not-allowed opacity-50'
                    : isDarkMode
                    ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700 border border-dark-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {t('Previous')}
              </button>

              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      page === pagination.currentPage
                        ? 'bg-accent-orange text-white'
                        : isDarkMode
                        ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700 border border-dark-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  pagination.currentPage === pagination.totalPages
                    ? 'cursor-not-allowed opacity-50'
                    : isDarkMode
                    ? 'bg-dark-800 text-dark-text-primary hover:bg-dark-700 border border-dark-600'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {t('Next')}
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
