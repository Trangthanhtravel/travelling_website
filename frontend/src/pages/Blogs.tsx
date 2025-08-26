import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Icon, Icons } from '../components/common/Icons';
import { Blog, BlogFilters } from '../types';

// Mock API function (replace with actual API call)
const getBlogs = async (filters: BlogFilters = {}): Promise<{ data: Blog[]; pagination: any }> => {
  // Mock data - replace with actual API call
  const mockBlogs: Blog[] = [
    {
      id: 1,
      type: 'blog',
      title: 'Hidden Gems of Northern Vietnam',
      slug: 'hidden-gems-northern-vietnam',
      content: `<p>Discover the breathtaking landscapes and rich culture of Northern Vietnam beyond the typical tourist trails...</p>`,
      excerpt: 'Explore remote villages, pristine lakes, and mountain passes that few tourists ever see in this comprehensive guide.',
      featured_image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      gallery: [],
      author: 1,
      status: 'published',
      featured: true,
      categories: ['Travel Tips', 'Vietnam'],
      tags: ['northern vietnam', 'hidden gems', 'adventure', 'culture'],
      language: 'en',
        seo_meta_title: 'Hidden Gems of Northern Vietnam - Off the Beaten Path',
    seo_meta_description: 'Discover secret destinations in Northern Vietnam',
    seo_keywords: ['vietnam travel', 'hidden gems', 'northern vietnam', 'adventure travel'],
      views: 1250,
      reading_time: 8,
      published_at: '2024-01-15T10:00:00Z',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      type: 'blog',
      title: 'Ultimate Guide to Japanese Cherry Blossom Season',
      slug: 'japanese-cherry-blossom-guide',
      content: `<p>Experience the magic of sakura season with our comprehensive guide...</p>`,
      excerpt: 'Everything you need to know about when, where, and how to experience Japan\'s famous cherry blossom season.',
      featured_image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      gallery: [],
      author: 2,
      status: 'published',
      featured: false,
      categories: ['Japan', 'Seasonal Travel'],
      tags: ['japan', 'cherry blossom', 'sakura', 'spring travel'],
      language: 'en',
        seo_meta_title: 'Japanese Cherry Blossom Season Guide - Best Times & Places',
        seo_meta_description: 'Complete guide to experiencing Japan\'s cherry blossom season',
        seo_keywords: ['japan travel', 'cherry blossom', 'sakura', 'spring japan'],
      views: 890,
      reading_time: 12,
      published_at: '2024-02-01T09:30:00Z',
      created_at: '2024-02-01T09:30:00Z',
      updated_at: '2024-02-01T09:30:00Z'
    },
    {
      id: 3,
      type: 'blog',
      title: 'Budget Travel Tips for Southeast Asia',
      slug: 'budget-travel-southeast-asia',
      content: `<p>Make your money go further with these proven budget travel strategies...</p>`,
      excerpt: 'Discover how to travel through Southeast Asia on a shoestring budget without sacrificing experiences.',
      featured_image: 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      gallery: [],
        author: 3,
      status: 'published',
      featured: true,
      categories: ['Travel Tips', 'Budget Travel'],
      tags: ['budget travel', 'southeast asia', 'backpacking', 'money saving'],
      language: 'en',
        seo_meta_title: 'Budget Travel Tips for Southeast Asia - Save Money While Exploring',
        seo_meta_description: 'Expert tips for budget travel in Southeast Asia',
        seo_keywords: ['budget travel', 'southeast asia', 'backpacking', 'cheap travel'],
      views: 2100,
      reading_time: 10,
      published_at: '2024-01-10T14:20:00Z',
      created_at: '2024-01-10T14:20:00Z',
      updated_at: '2024-01-10T14:20:00Z'
    }
  ];

  // Simple filtering for mock data
  let filteredBlogs = mockBlogs.filter(blog => blog.status === 'published');

  if (filters.category) {
    filteredBlogs = filteredBlogs.filter(blog =>
      blog.categories.some(cat => cat.toLowerCase().includes(filters.category!.toLowerCase()))
    );
  }

  if (filters.search) {
    filteredBlogs = filteredBlogs.filter(blog =>
      blog.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(filters.search!.toLowerCase())
    );
  }

  return {
    data: filteredBlogs,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: filteredBlogs.length,
      hasNext: false,
      hasPrev: false
    }
  };
};

const Blogs: React.FC = () => {
  const [filters, setFilters] = useState<BlogFilters>({
    sortBy: 'publishedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  });

  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['blogs', filters],
    queryFn: () => getBlogs(filters),
  });

  const blogs = blogsData?.data || [];
  const featuredBlogs = blogs.filter(blog => blog.featured);
  const regularBlogs = blogs.filter(blog => !blog.featured);

  const categories = ['All', 'Travel Tips', 'Vietnam', 'Japan', 'Budget Travel', 'Seasonal Travel'];

  const handleCategoryFilter = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: category === 'All' ? undefined : category,
      page: 1
    }));
  };

  const handleSearch = (search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search.trim() || undefined,
      page: 1
    }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
        <div className="animate-pulse max-w-7xl mx-auto px-4 py-8">
          <div className="h-12 bg-gray-300 dark:bg-dark-700 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-300 dark:bg-dark-700 h-96 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Hero Section */}
      <section className="relative h-96 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold font-serif mb-6">
              Travel Blog
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Stories, tips, and inspiration for your next adventure
            </p>
            <p className="text-lg text-primary-50 max-w-2xl">
              Discover hidden gems, expert travel advice, and authentic experiences from our team of travel enthusiasts.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-40 bg-white dark:bg-dark-800 shadow-md border-b dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryFilter(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    (category === 'All' && !filters.category) || filters.category === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Icon icon={Icons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Featured Articles */}
          {featuredBlogs.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Featured Articles</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredBlogs.map((blog) => (
                  <Link
                    key={blog.id}
                    to={`/blogs/${blog.slug}`}
                    className="group bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Featured
                        </span>
                      </div>
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {blog.reading_time} min read
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatDate(blog.published_at!)}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {blog.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-sm"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Regular Articles */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Latest Articles</h2>
            {regularBlogs.length === 0 ? (
              <div className="text-center py-16">
                <Icon icon={Icons.FiFileText} className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No articles found</h3>
                <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                  Try adjusting your search terms or category filters to find what you're looking for.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {regularBlogs.map((blog) => (
                  <Link
                    key={blog.id}
                    to={`/blogs/${blog.slug}`}
                    className="group bg-white dark:bg-dark-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
                        {blog.reading_time} min read
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span>{formatDate(blog.published_at!)}</span>
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {blog.categories.slice(0, 2).map((category) => (
                          <span
                            key={category}
                            className="bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blogs;
