import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Icon, Icons } from '../components/common/Icons';
import { BlogFilters } from '../types';
import { blogAPI } from '../utils/api';
import { useTranslation } from '../contexts/TranslationContext';
import { useTheme } from '../contexts/ThemeContext';

const Blogs: React.FC = () => {
  const { t, language } = useTranslation();
  const { isDarkMode } = useTheme();

  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc',
    language: language // Add language to filters
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Update filters when language changes
  React.useEffect(() => {
    setFilters(prev => ({
      ...prev,
      language: language,
      page: 1 // Reset to first page when language changes
    }));
  }, [language]);

  // Fetch blogs using real API with language support
  const { data: blogsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['blogs', filters, language],
    queryFn: async () => {
      const response = await blogAPI.getBlogs({ ...filters, language });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const blogs = blogsResponse?.data?.blogs || [];
  const pagination = blogsResponse?.pagination || {};

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      search: searchTerm,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTag('');
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'created_at',
      sortOrder: 'desc',
      language: language
    });
  };

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            {t('Error Loading Blogs')}
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            {t('Sorry, we couldn\'t load the blogs. Please try again.')}
          </p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('Try Again')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('Travel Blog')}</h1>
            <p className="text-xl mb-8 opacity-90">
              {t('Discover amazing destinations and travel tips from our experts')}
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b py-6`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('Search blogs...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900'
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                />
                <Icon icon={Icons.FiSearch} className={`absolute left-3 top-2.5 h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
              </div>
            </form>

            {/* Sort */}
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  'created_at' | 'published_at' | 'views' | 'title',
                  'asc' | 'desc'
                ];
                setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
              }}
              className={`px-4 py-2 border ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="created_at-desc">{t('Latest First')}</option>
              <option value="created_at-asc">{t('Oldest First')}</option>
              <option value="views-desc">{t('Most Popular')}</option>
              <option value="title-asc">{t('Title A-Z')}</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory || selectedTag) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('Clear Filters')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <div key={index} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden animate-pulse`}>
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blog Grid */}
      {!isLoading && blogs.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog: any) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.slug}`}
                className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg group`}
              >
                {/* Featured Image */}
                {blog.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {blog.featured && (
                      <div className="absolute top-3 left-3 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        {t('Featured')}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-6">
                  {/* Categories */}
                  {blog.categories && JSON.parse(blog.categories).length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {JSON.parse(blog.categories).slice(0, 2).map((category: string, index: number) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 group-hover:text-blue-600 transition-colors`}>
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 line-clamp-3`}>
                    {blog.excerpt}
                  </p>

                  {/* Meta Info */}
                  <div className={`flex items-center justify-between text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>
                      {blog.authorProfile?.name || 'Anonymous'}
                    </span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Icon icon={Icons.FiEye} className="h-4 w-4 mr-1" />
                        {blog.views || 0}
                      </span>
                      <span>
                        {new Date(blog.published_at || blog.created_at).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.hasPrev 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : `${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                  } transition-colors`}
                >
                  {t('Previous')}
                </button>

                {/* Page Numbers */}
                {[...Array(Math.min(5, pagination.totalPages))].map((_, index) => {
                  const pageNum = Math.max(1, pagination.currentPage - 2) + index;
                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        pageNum === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : `${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                      } transition-colors`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className={`px-4 py-2 rounded-lg ${
                    pagination.hasNext 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : `${isDarkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-400'} cursor-not-allowed`
                  } transition-colors`}
                >
                  {t('Next')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!isLoading && blogs.length === 0 && (
        <div className="container mx-auto px-4 py-12 text-center">
          <div className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            <Icon icon={Icons.FiFileText} className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{t('No blogs found')}</h3>
            <p className="mb-4">{t('Try adjusting your search or filters to find what you\'re looking for.')}</p>
            {(searchTerm || selectedCategory || selectedTag) && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('Clear Filters')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
