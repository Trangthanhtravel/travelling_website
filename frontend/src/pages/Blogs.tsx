import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Icon, Icons } from '../components/common/Icons';
import { BlogFilters } from '../types';
import { blogAPI } from '../utils/api';

const Blogs: React.FC = () => {
  const [filters, setFilters] = useState<BlogFilters>({
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  // Fetch blogs using real API
  const { data: blogsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['blogs', filters],
    queryFn: async () => {
      const response = await blogAPI.getBlogs(filters);
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
      sortOrder: 'desc'
    });
  };


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Blogs</h2>
          <p className="text-gray-600 mb-4">Sorry, we couldn't load the blogs. Please try again.</p>
          <button
            onClick={() => refetch()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Travel Blog</h1>
            <p className="text-xl mb-8 opacity-90">
              Discover amazing destinations and travel tips from our experts
            </p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Icon icon={Icons.FiSearch} className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="created_at-desc">Latest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="views-desc">Most Popular</option>
              <option value="title-asc">Title A-Z</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory || selectedTag) && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear Filters
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
              <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-300"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blogs Grid */}
      {!isLoading && (
        <div className="container mx-auto px-4 py-12">
          {blogs.length === 0 ? (
            <div className="text-center py-12">
              <Icon icon={Icons.FiSearch} className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No blogs found</h3>
              <p className="text-gray-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogs.map((blog: any) => (
                  <article key={blog.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {blog.featured_image && (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      {/* Categories */}
                      {blog.categories && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(typeof blog.categories === 'string' ? blog.categories.split(',') : blog.categories)
                            .slice(0, 2)
                            .map((category: string, index: number) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                              >
                                {category.trim()}
                              </span>
                            ))}
                        </div>
                      )}

                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        <Link
                          to={`/blog/${blog.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {blog.title}
                        </Link>
                      </h2>

                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Icon icon={Icons.FiEye} className="h-4 w-4" />
                            {blog.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Icon icon={Icons.FiClock} className="h-4 w-4" />
                            {blog.reading_time || 5} min read
                          </span>
                        </div>
                        <time dateTime={blog.published_at || blog.created_at}>
                          {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                        </time>
                      </div>

                      <Link
                        to={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Read More
                        <Icon icon={Icons.FiArrowRight} className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-12 gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg ${
                          page === pagination.currentPage
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Blogs;
