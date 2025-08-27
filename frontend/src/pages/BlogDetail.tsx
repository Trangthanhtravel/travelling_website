import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon, Icons } from '../components/common/Icons';
import { mockBlogs, Blog } from '../data/mockBlogs';

// Mock API function (replace with actual API call)
const getBlogBySlug = async (slug: string): Promise<{ data: { blog: Blog } }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const blog = mockBlogs.find(blog => blog.slug === slug);
  if (!blog) {
    throw new Error('Blog not found');
  }
  
  return { data: { blog } };
};

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: blogData, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => getBlogBySlug(slug!),
    enabled: !!slug,
  });

  const blog = blogData?.data.blog;

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
        <div className="animate-pulse max-w-4xl mx-auto px-4 py-8">
          <div className="h-8 bg-gray-300 dark:bg-dark-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-dark-700 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-gray-300 dark:bg-dark-700 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 dark:bg-dark-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Article Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">The article you're looking for doesn't exist or has been removed.</p>
          <Link to="/blogs" className="btn-primary">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Breadcrumb */}
      <nav className="bg-white dark:bg-dark-850 border-b dark:border-dark-700 pt-20 md:pt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              Home
            </Link>
            <Icon icon={Icons.FiChevronRight} className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <Link to="/blogs" className="text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              Blog
            </Link>
            <Icon icon={Icons.FiChevronRight} className="w-4 h-4 text-gray-400 dark:text-gray-500" />
            <span className="text-gray-900 dark:text-white font-medium truncate">
              {blog.title}
            </span>
          </div>
        </div>
      </nav>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.categories.map((category) => (
              <span
                key={category}
                className="bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium"
              >
                {category}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-8">
            <div className="flex items-center space-x-4">
              <span>By {blog.authorName}</span>
              <span>•</span>
              <span>{formatDate(blog.published_at)}</span>
              <span>•</span>
              <span>{blog.reading_time} min read</span>
              <span>•</span>
              <span>{blog.views.toLocaleString()} views</span>
            </div>
          </div>

          {blog.featured_image && (
            <div className="mb-8">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="border-t dark:border-dark-700 pt-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-dark-600 cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {blog.gallery.length > 0 && (
          <div className="border-t dark:border-dark-700 pt-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gallery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blog.gallery.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t dark:border-dark-700 pt-8">
          <div className="flex justify-between items-center">
            <Link
              to="/blogs"
              className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
            >
              <Icon icon={Icons.FiArrowLeft} className="w-4 h-4" />
              <span>Back to Blog</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">Share this article:</span>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  <Icon icon={Icons.FiShare2} className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
