import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
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

      {/* Blog Content */}
      <article className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
            <span>By {blog.author_name || 'Admin'}</span>
            <span>•</span>
            <time>{formatDate(blog.created_at)}</time>
            <span>•</span>
            <span>{blog.views || 0} views</span>
            {blog.featured && (
              <>
                <span>•</span>
                <span className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-2 py-1 rounded text-xs font-medium">
                  Featured
                </span>
              </>
            )}
          </div>

          {blog.excerpt && (
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
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

        {/* Blog Content with Markdown Support */}
        <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-gray-900 dark:prose-strong:text-white">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              // Custom components for better styling
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-8 mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>
              ),
              a: ({ href, children }) => (
                <a href={href} className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img src={src} alt={alt} className="w-full rounded-lg shadow-lg my-6" />
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-400 my-4">
                  {children}
                </blockquote>
              ),
              code: ({ children }) => (
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4">
                  {children}
                </pre>
              ),
            }}
          >
            {blog.content || 'No content available.'}
          </ReactMarkdown>
        </div>

        {/* Tags */}
        {blog.tags && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.split(',').map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-block bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 px-3 py-1 rounded-full text-sm"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <Icon icon={Icons.FiArrowLeft} className="h-4 w-4" />
            Back to all blogs
          </Link>
        </div>
      </article>
    </div>
  );
};

export default BlogDetail;
