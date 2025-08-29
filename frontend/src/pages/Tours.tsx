import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { toursAPI } from '../utils/api';
import { Tour, TourFilters } from '../types';
import { Icon, Icons } from '../components/common/Icons';

const Tours: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<TourFilters>({
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Load initial filters from URL params
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== 'all') {
      setFilters(prev => ({ ...prev, category: categoryFromUrl }));
    }
  }, [searchParams]);

  // Fetch tour categories from database
  const { data: categoriesData } = useQuery({
    queryKey: ['tour-categories'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/categories?type=tour&status=active`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const categories = [
    { value: '', label: 'All Categories' },
    ...(categoriesData?.data || []).map((cat: any) => ({
      value: cat.slug,
      label: cat.name
    }))
  ];

  const { data: toursData, isLoading, error } = useQuery({
    queryKey: ['tours', filters],
    queryFn: () => toursAPI.getTours(filters),
  });

  const sortOptions = [
    { value: 'created_at-desc', label: 'Newest First' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'title-asc', label: 'Name: A to Z' },
    { value: 'title-desc', label: 'Name: Z to A' },
  ];

  const handleFilterChange = (key: keyof TourFilters, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSortChange = (sortValue: string) => {
    const [sortBy, sortOrder] = sortValue.split('-');
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder as 'asc' | 'desc',
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const pagination = toursData?.data?.pagination;
  const tours = toursData?.data?.data || [];

  // Ensure tours is treated as an array
  const toursArray: Tour[] = Array.isArray(tours) ? tours : [];

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
      {/* Hero Section */}
      <div className="bg-accent-orange text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Discover Amazing Tours</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Explore our curated collection of unforgettable travel experiences around the world
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className={`rounded-lg shadow-lg p-6 sticky top-4 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-light-50 border border-light-300'}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-accent-orange hover:text-accent-orange-hover transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-secondary'}`}>
                  Search Tours
                </label>
                <div className="relative">
                  <Icon icon={Icons.FiSearch} className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`} />
                  <input
                    type="text"
                    placeholder="Search destinations, tours..."
                    className="input-field pl-10"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-secondary'}`}>
                  Category
                </label>
                <select
                  className="input-field"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-secondary'}`}>
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-field"
                    value={filters.minPrice || ''}
                    onChange={(e) => handleFilterChange('minPrice', Number(e.target.value) || undefined)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-field"
                    value={filters.maxPrice || ''}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value) || undefined)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className={`rounded-lg shadow-sm p-4 mb-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-light-50 border border-light-300'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`lg:hidden inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isDarkMode 
                        ? 'bg-dark-700 text-dark-text-primary hover:bg-dark-600' 
                        : 'bg-light-200 text-light-text-secondary hover:bg-light-300'
                    }`}
                  >
                    <Icon icon={Icons.FiFilter} className="w-4 h-4 mr-2" />
                    Filters
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-accent-orange text-white'
                          : isDarkMode
                          ? 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-700'
                          : 'text-light-text-muted hover:text-light-text-primary hover:bg-light-200'
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
                          : 'text-light-text-muted hover:text-light-text-primary hover:bg-light-200'
                      }`}
                    >
                      <Icon icon={Icons.FiList} className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                    {pagination?.total || 0} tours found
                  </span>
                  
                  <select
                    className="input-field w-auto min-w-[180px]"
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => handleSortChange(e.target.value)}
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className={`rounded-xl shadow-lg animate-pulse ${isDarkMode ? 'bg-dark-800' : 'bg-light-50'}`}>
                    <div className={`h-48 rounded-t-xl ${isDarkMode ? 'bg-dark-700' : 'bg-light-200'}`}></div>
                    <div className="p-6">
                      <div className={`h-4 rounded mb-2 ${isDarkMode ? 'bg-dark-700' : 'bg-light-200'}`}></div>
                      <div className={`h-6 rounded mb-4 ${isDarkMode ? 'bg-dark-700' : 'bg-light-200'}`}></div>
                      <div className={`h-4 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-light-200'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-light-50 border border-light-300'}`}>
                <Icon icon={Icons.FiAlertCircle} className="w-12 h-12 text-error mx-auto mb-4" />
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
                  Error loading tours
                </h3>
                <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'} mb-4`}>
                  Please try again later or adjust your filters.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Tours Grid/List */}
            {!isLoading && !error && toursArray.length > 0 && (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                {toursArray.map((tour: Tour) => (
                  <div
                    key={tour.id}
                    className={`group overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ${
                      isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-light-50 border border-light-300'
                    } ${viewMode === 'grid' ? 'rounded-xl' : 'rounded-lg flex flex-col sm:flex-row'}`}
                  >
                    <div className={`relative overflow-hidden ${
                      viewMode === 'grid' ? 'h-48' : 'h-48 sm:h-auto sm:w-64 flex-shrink-0'
                    }`}>
                      <img
                        src={typeof tour.images?.[0] === 'string' ? tour.images[0] : tour.image_url || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-accent-orange text-white rounded-full px-3 py-1 text-sm font-medium">
                        ${tour.price || tour.pricing?.basePrice || 0}
                      </div>
                      {tour.featured && (
                        <div className="absolute top-4 left-4 bg-warning text-white px-2 py-1 rounded text-xs font-medium">
                          Featured
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className={`flex items-center text-sm mb-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                        <Icon icon={Icons.FiMapPin} className="w-4 h-4 mr-1" />
                        <span>{tour.location}</span>
                      </div>
                      <h3 className={`font-bold mb-2 group-hover:text-accent-orange transition-colors duration-200 ${
                        viewMode === 'grid' ? 'text-xl' : 'text-lg'
                      } ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                        {tour.title}
                      </h3>
                      <p className={`text-sm mb-4 line-clamp-2 flex-grow ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                        {tour.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                          <Icon icon={Icons.FiClock} className="w-4 h-4 mr-1" />
                          <span>{tour.duration}</span>
                        </div>
                        <div className={`flex items-center text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                          <Icon icon={Icons.FiUsers} className="w-4 h-4 mr-1" />
                          <span>Max {tour.max_participants || tour.maxParticipants || 0}</span>
                        </div>
                      </div>

                      {/* View Details Button */}
                      <Link
                        to={`/tours/${tour.slug || tour.id}`}
                        className="w-full bg-accent-orange hover:bg-accent-orange-hover text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200 text-center"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !error && toursArray.length === 0 && (
              <div className={`text-center py-12 rounded-lg ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-light-50 border border-light-300'}`}>
                <Icon icon={Icons.FiSearch} className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`} />
                <h3 className={`text-lg font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-primary'}`}>
                  No tours found
                </h3>
                <p className={`mb-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={clearFilters}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pagination.currentPage === 1
                        ? isDarkMode ? 'text-dark-text-muted cursor-not-allowed' : 'text-light-text-muted cursor-not-allowed'
                        : isDarkMode ? 'text-dark-text-primary hover:bg-dark-700' : 'text-light-text-primary hover:bg-light-200'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        page === pagination.currentPage
                          ? 'bg-accent-orange text-white'
                          : isDarkMode
                          ? 'text-dark-text-primary hover:bg-dark-700'
                          : 'text-light-text-primary hover:bg-light-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pagination.currentPage === pagination.totalPages
                        ? isDarkMode ? 'text-dark-text-muted cursor-not-allowed' : 'text-light-text-muted cursor-not-allowed'
                        : isDarkMode ? 'text-dark-text-primary hover:bg-dark-700' : 'text-light-text-primary hover:bg-light-200'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tours;
