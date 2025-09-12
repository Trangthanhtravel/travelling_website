import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Icon, Icons } from '../components/common/Icons';
import { blogAPI } from '../utils/api';
import { useTranslation } from '../contexts/TranslationContext';
import { useTheme } from '../contexts/ThemeContext';

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, language } = useTranslation();
  const { isDarkMode } = useTheme();

  const { data: blogResponse, isLoading, error } = useQuery({
    queryKey: ['blog', slug, language],
    queryFn: async () => {
      const response = await blogAPI.getBlogBySlug(slug!, { language });
      return response.data;
    },
    enabled: !!slug,
  });

  const blog = blogResponse?.data?.blog;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'} transition-colors duration-200`}>
        <div className="animate-pulse max-w-4xl mx-auto px-4 py-8">
          <div className={`h-8 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded mb-4`}></div>
          <div className={`h-4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded w-1/3 mb-8`}></div>
          <div className={`h-64 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded mb-8`}></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`h-4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'} flex items-center justify-center transition-colors duration-200`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-light-text-primary'} mb-4`}>
            {t('Blog not found')}
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-light-text-muted'} mb-4`}>
            {t('The blog post you are looking for does not exist or has been removed.')}
          </p>
          <Link
            to="/blogs"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            {t('Back to Blogs')}
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'} flex items-center justify-center transition-colors duration-200`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-light-text-primary'} mb-4`}>
            {t('Blog not found')}
          </h2>
          <Link
            to="/blogs"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            {t('Back to Blogs')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'} transition-colors duration-200`}>
      {/* Breadcrumb */}
      <div className={`${isDarkMode ? 'bg-dark-800 border-dark-600' : 'bg-white border-gray-200'} border-b py-4 transition-colors duration-200`}>
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              to="/"
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-light-text-muted hover:text-light-text-primary'} transition-colors duration-200`}
            >
              {t('Home')}
            </Link>
            <Icon icon={Icons.FiChevronRight} className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <Link
              to="/blogs"
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-light-text-muted hover:text-light-text-primary'} transition-colors duration-200`}
            >
              {t('News')}
            </Link>
            <Icon icon={Icons.FiChevronRight} className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
              {blog.title}
            </span>
          </nav>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          {/* Categories */}
          {blog.categories && (
            <div className="flex flex-wrap gap-2 mb-4">
              {(() => {
                try {
                  // Try to parse as JSON first
                  const categories = typeof blog.categories === 'string'
                    ? (blog.categories.startsWith('[') || blog.categories.startsWith('{')
                        ? JSON.parse(blog.categories)
                        : blog.categories.split(',').map(cat => cat.trim()).filter(cat => cat)
                      )
                    : blog.categories;

                  const categoryArray = Array.isArray(categories) ? categories : [categories];

                  return categoryArray.map((category: string, index: number) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                    >
                      {category}
                    </span>
                  ));
                } catch (error) {
                  console.error('Error parsing categories:', error);
                  // Fallback: treat as comma-separated string
                  const categories = blog.categories.toString().split(',').map(cat => cat.trim()).filter(cat => cat);
                  return categories.map((category: string, index: number) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 text-sm px-3 py-1 rounded-full"
                    >
                      {category}
                    </span>
                  ));
                }
              })()}
            </div>
          )}

          {/* Title */}
          <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-light-text-primary'} mb-4`}>
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className={`flex flex-wrap items-center gap-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-light-text-muted'} mb-6`}>
            <div className="flex items-center">
              <Icon icon={Icons.FiUser} className="h-4 w-4 mr-2" />
              <span>{blog.authorProfile?.name || 'Anonymous'}</span>
            </div>
            <div className="flex items-center">
              <Icon icon={Icons.FiCalendar} className="h-4 w-4 mr-2" />
              <span>{formatDate(blog.published_at || blog.created_at)}</span>
            </div>
            <div className="flex items-center">
              <Icon icon={Icons.FiEye} className="h-4 w-4 mr-2" />
              <span>{blog.views || 0} {t('views')}</span>
            </div>
            {blog.reading_time && (
              <div className="flex items-center">
                <Icon icon={Icons.FiClock} className="h-4 w-4 mr-2" />
                <span>{blog.reading_time} {t('min read')}</span>
              </div>
            )}
          </div>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-light-text-muted'} leading-relaxed mb-6`}>
              {blog.excerpt}
            </p>
          )}
        </header>

        {/* Featured Image */}
        {blog.featured_image && (
          <div className="mb-8">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className={`prose prose-lg max-w-none mb-8 ${
          isDarkMode 
            ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-primary-400 prose-strong:text-white prose-code:text-gray-300 prose-pre:bg-dark-800 prose-blockquote:border-primary-500 prose-blockquote:text-gray-300' 
            : 'prose-gray prose-headings:text-light-text-primary prose-p:text-light-text-muted prose-a:text-primary-600 prose-strong:text-light-text-primary prose-blockquote:border-primary-500'
        }`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt}
                  className="w-full rounded-lg shadow-md my-6"
                />
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${isDarkMode ? 'text-primary-400 hover:text-primary-300' : 'text-primary-600 hover:text-primary-700'} transition-colors duration-200`}
                >
                  {children}
                </a>
              ),
              h1: ({ children }) => (
                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-light-text-primary'} mt-8 mb-4`}>
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-light-text-primary'} mt-6 mb-3`}>
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-light-text-primary'} mt-5 mb-2`}>
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-light-text-muted'} leading-relaxed mb-4`}>
                  {children}
                </p>
              ),
              blockquote: ({ children }) => (
                <blockquote className={`border-l-4 ${isDarkMode ? 'border-primary-500 bg-dark-800' : 'border-primary-500 bg-gray-50'} pl-4 py-2 my-6 italic`}>
                  {children}
                </blockquote>
              ),
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {blog.tags && (() => {
          try {
            const tags = typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags;
            return Array.isArray(tags) && tags.length > 0;
          } catch {
            return blog.tags && blog.tags.length > 0;
          }
        })() && (
          <div className="mb-8">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-light-text-primary'} mb-3`}>
              {t('Tags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(() => {
                try {
                  const tags = typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags;
                  return Array.isArray(tags) ? tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className={`${isDarkMode ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-700'} text-sm px-3 py-1 rounded-full transition-colors duration-200`}
                    >
                      #{tag}
                    </span>
                  )) : [];
                } catch {
                  // If JSON parsing fails, treat as comma-separated string
                  const tags = blog.tags.split(',').map(t => t.trim()).filter(t => t);
                  return tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className={`${isDarkMode ? 'bg-dark-700 text-gray-300' : 'bg-gray-100 text-gray-700'} text-sm px-3 py-1 rounded-full transition-colors duration-200`}
                    >
                      #{tag}
                    </span>
                  ));
                }
              })()}
            </div>
          </div>
        )}

        {/* Gallery */}
        {blog.gallery && (() => {
          try {
            const gallery = typeof blog.gallery === 'string' ? JSON.parse(blog.gallery) : blog.gallery;
            return Array.isArray(gallery) && gallery.length > 0;
          } catch {
            return false;
          }
        })() && (
          <div className="mb-8">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-light-text-primary'} mb-3`}>
              {t('Gallery')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                try {
                  const gallery = typeof blog.gallery === 'string' ? JSON.parse(blog.gallery) : blog.gallery;
                  return Array.isArray(gallery) ? gallery.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    />
                  )) : [];
                } catch {
                  return [];
                }
              })()}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex justify-between items-center pt-8 border-t ${isDarkMode ? 'border-dark-600' : 'border-gray-200'} transition-colors duration-200`}>
          <Link
            to="/blogs"
            className={`flex items-center ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-light-text-muted hover:text-light-text-primary'} transition-colors duration-200`}
          >
            <Icon icon={Icons.FiArrowLeft} className="h-4 w-4 mr-2" />
            {t('Back to Blogs')}
          </Link>

          {/* Share buttons could be added here */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {t('Share')}:
            </span>
            {/* Add share buttons as needed */}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
