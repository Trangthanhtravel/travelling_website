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
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-pulse max-w-4xl mx-auto px-4 py-8">
          <div className={`h-8 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-4`}></div>
          <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/3 mb-8`}></div>
          <div className={`h-64 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-8`}></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            {t('Blog not found')}
          </h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            {t('The blog post you are looking for does not exist or has been removed.')}
          </p>
          <Link
            to="/blogs"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('Back to Blogs')}
          </Link>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            {t('Blog not found')}
          </h2>
          <Link
            to="/blogs"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('Back to Blogs')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Breadcrumb */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b py-4`}>
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              to="/"
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              {t('Home')}
            </Link>
            <Icon icon={Icons.FiChevronRight} className={`h-4 w-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <Link
              to="/blogs"
              className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
            >
              {t('Blogs')}
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
          {blog.categories && JSON.parse(blog.categories).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {JSON.parse(blog.categories).map((category: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  {category}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className={`flex flex-wrap items-center gap-6 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
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
            <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-6`}>
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
        <div className={`prose prose-lg max-w-none ${
            isDarkMode 
            ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-gray-300 prose-pre:bg-gray-800' 
            : 'prose-gray'
        } mb-8`}>
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
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {children}
                </a>
              ),
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {blog.tags && JSON.parse(blog.tags).length > 0 && (
          <div className="mb-8">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
              {t('Tags')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {JSON.parse(blog.tags).map((tag: string, index: number) => (
                <span
                  key={index}
                  className={`${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'} text-sm px-3 py-1 rounded-full`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {blog.gallery && blog.gallery.length > 0 && (
          <div className="mb-8">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>
              {t('Gallery')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blog.gallery.map((image: string, index: number) => (
                <img
                  key={index}
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                />
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex justify-between items-center pt-8 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Link
            to="/blogs"
            className={`flex items-center ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}
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
