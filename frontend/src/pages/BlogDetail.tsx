import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon, Icons } from '../components/common/Icons';
import { blogAPI } from '../utils/api';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: blogResponse, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const response = await blogAPI.getBlogBySlug(slug!);
      return response.data;
    },
    enabled: !!slug,
  });

  const blog = blogResponse?.data?.blog;

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Sorry, we couldn't find the blog you're looking for.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon icon={Icons.FiArrowLeft} className="h-4 w-4" />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Blog Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The blog you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon icon={Icons.FiArrowLeft} className="h-4 w-4" />
            Back to Blogs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400">
              Home
            </Link>
            <Icon icon={Icons.FiChevronRight} className="h-4 w-4" />
            <Link to="/blogs" className="hover:text-blue-600 dark:hover:text-blue-400">
              Blogs
            </Link>
            <Icon icon={Icons.FiChevronRight} className="h-4 w-4" />
            <span className="text-gray-900 dark:text-white">{blog.title}</span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Categories */}
          {blog.categories && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(typeof blog.categories === 'string' ? blog.categories.split(',') : blog.categories)
                .map((category: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full"
                  >
                    {category.trim()}
                  </span>
                ))}
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {blog.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-400 mb-6">
            {blog.authorProfile && (
              <div className="flex items-center gap-2">
                <Icon icon={Icons.FiUser} className="h-4 w-4" />
                <span>{blog.authorProfile.name}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Icon icon={Icons.FiCalendar} className="h-4 w-4" />
              <time dateTime={blog.published_at || blog.created_at}>
                {formatDate(blog.published_at || blog.created_at)}
              </time>
            </div>

            <div className="flex items-center gap-2">
              <Icon icon={Icons.FiClock} className="h-4 w-4" />
              <span>{blog.reading_time || 5} min read</span>
            </div>

            <div className="flex items-center gap-2">
              <Icon icon={Icons.FiEye} className="h-4 w-4" />
              <span>{blog.views || 0} views</span>
            </div>
          </div>

          {/* Featured Image */}
          {blog.featured_image && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover"
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>

        {/* Tags */}
        {blog.tags && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {(typeof blog.tags === 'string' ? blog.tags.split(',') : blog.tags)
                .map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                  >
                    #{tag.trim()}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center pt-8 border-t border-gray-200 dark:border-dark-700">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            <Icon icon={Icons.FiArrowLeft} className="h-4 w-4" />
            Back to Blogs
          </Link>

          <div className="flex gap-4">
            <button
              onClick={() => navigator.share && navigator.share({
                title: blog.title,
                text: blog.excerpt,
                url: window.location.href
              })}
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Icon icon={Icons.FiShare} className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
