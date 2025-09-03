import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon, Icons } from '../components/common/Icons';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';

const CarRental: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc'
  });

  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Fetch car rental services from API
  const { data: carRentalsData, isLoading, error } = useQuery({
    queryKey: ['car-rentals', { search: searchTerm, ...filters }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('service_type', 'car-rental');
      if (searchTerm) params.append('search', searchTerm);
      params.append('status', 'active');
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      params.append('sortBy', filters.sortBy);
      params.append('sortOrder', filters.sortOrder);

      const response = await fetch(`${getApiUrl()}/services?${params}`);
      if (!response.ok) throw new Error('Failed to fetch car rental services');
      return response.json();
    },
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

  const pagination = carRentalsData?.pagination;
  const carRentals = carRentalsData?.data || [];

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="text-center py-12">
          <Icon icon={Icons.FiAlertCircle} className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error loading car rentals</h3>
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
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('Private Car Rental')}</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Premium vehicle fleet for your travel needs
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className={`rounded-lg shadow-lg p-6 mb-8 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                {t('Search')} {t('Car Rentals')}
              </label>
              <div className="relative">
                <Icon icon={Icons.FiSearch} className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search car rentals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                Sort By
              </label>
              <select
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="title-asc">Name: A to Z</option>
                <option value="title-desc">Name: Z to A</option>
              </select>
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

        {/* Car Rentals Grid/List */}
        {!isLoading && carRentals.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
            {carRentals.map((car: any) => (
              <div
                key={car.id}
                className={`group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                  isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white border border-gray-200'
                } ${viewMode === 'grid' ? 'rounded-xl' : 'rounded-lg flex flex-col sm:flex-row'}`}
              >
                <div className={`relative overflow-hidden ${
                  viewMode === 'grid' ? 'h-48' : 'h-48 sm:h-auto sm:w-64 flex-shrink-0'
                }`}>
                  <img
                    src={car.image || `https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                    alt={car.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-accent-orange text-white rounded-full px-3 py-1 text-sm font-medium">
                    ${car.price}/{car.duration || 'day'}
                  </div>
                  {car.featured && (
                    <div className="absolute top-4 left-4 bg-warning text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className={`flex items-center text-sm mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                    <Icon icon={Icons.FiTruck} className="w-4 h-4 mr-1" />
                    <span>Car Rental</span>
                  </div>
                  <h3 className={`font-bold mb-2 group-hover:text-accent-orange transition-colors duration-200 ${
                    viewMode === 'grid' ? 'text-xl' : 'text-lg'
                  } ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
                    {car.title}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-2 flex-grow ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                    {car.description}
                  </p>

                  {car.duration && (
                    <div className={`flex items-center text-sm mb-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                      <Icon icon={Icons.FiClock} className="w-4 h-4 mr-1" />
                      <span>{car.duration}</span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <Link
                    to={`/services/${car.slug}`}
                    className="w-full bg-accent-orange hover:bg-accent-orange-hover text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
                  >
                    {t('View Details')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && carRentals.length === 0 && (
          <div className="text-center py-12">
            <Icon icon={Icons.FiTruck} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No car rentals found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search terms' : 'No car rental services are currently available'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && carRentals.length > 0 && pagination && (
          <div className="mt-8">
            <div className={`flex justify-between items-center mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
              <div className="text-sm">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
              </div>
              <div className="text-sm">
                Page {pagination.page} of {pagination.pages}
              </div>
            </div>

            {pagination.pages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`px-3 py-2 rounded-lg border ${
                    pagination.page <= 1
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-700'
                  } ${isDarkMode ? 'border-dark-600 text-dark-text-primary' : 'border-gray-300 text-gray-700'}`}
                >
                  Previous
                </button>

                {[...Array(Math.min(5, pagination.pages))].map((_, index) => {
                  const page = Math.max(1, pagination.page - 2) + index;
                  if (page > pagination.pages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg border ${
                        page === pagination.page
                          ? 'bg-accent-orange text-white border-accent-orange'
                          : isDarkMode
                          ? 'border-dark-600 text-dark-text-primary hover:bg-dark-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className={`px-3 py-2 rounded-lg border ${
                    pagination.page >= pagination.pages
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-700'
                  } ${isDarkMode ? 'border-dark-600 text-dark-text-primary' : 'border-gray-300 text-gray-700'}`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CarRental;
