import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface BlogFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  categories: string;
  tags: string;
  seo_meta_title: string;
  seo_meta_description: string;
  seo_keywords: string;
}

const BlogEditor: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const queryClient = useQueryClient();
  const isEditing = !!blogId && blogId !== 'new';

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image: '',
    status: 'draft',
    featured: false,
    categories: '',
    tags: '',
    seo_meta_title: '',
    seo_meta_description: '',
    seo_keywords: ''
  });

  // Fetch blog for editing
  const { data: blogData, isLoading } = useQuery({
    queryKey: ['blog', blogId],
    queryFn: async () => {
      if (!isEditing) return null;
      const response = await fetch(`${process.env.REACT_APP_API_URL}/blogs/${blogId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch blog');
      return response.json();
    },
    enabled: isEditing
  });

  // Populate form when editing
  useEffect(() => {
    if (blogData?.data?.blog) {
      const blog = blogData.data.blog;
      setFormData({
        title: blog.title || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        content: blog.content || '',
        featured_image: blog.featured_image || '',
        status: blog.status || 'draft',
        featured: blog.featured || false,
        categories: blog.categories || '',
        tags: blog.tags || '',
        seo_meta_title: blog.seo_meta_title || '',
        seo_meta_description: blog.seo_meta_description || '',
        seo_keywords: blog.seo_keywords || ''
      });
    }
  }, [blogData]);

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle title change and auto-generate slug
  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: !isEditing ? generateSlug(title) : prev.slug
    }));
  };

  // Save blog mutation
  const saveBlogMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const url = isEditing
        ? `${process.env.REACT_APP_API_URL}/blogs/admin/${blogId}`
        : `${process.env.REACT_APP_API_URL}/blogs/admin`;

      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          content: data.content,
          featuredImage: data.featured_image,
          status: data.status,
          featured: data.featured,
          categories: data.categories ? data.categories.split(',').map(c => c.trim()) : [],
          tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
          seoData: {
            meta_title: data.seo_meta_title,
            meta_description: data.seo_meta_description,
            keywords: data.seo_keywords
          }
        })
      });

      if (!response.ok) throw new Error('Failed to save blog');
      return response.json();
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Blog updated successfully' : 'Blog created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      navigate('/admin/blogs');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to save blog');
    }
  });

  const handleInputChange = (field: keyof BlogFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (!formData.title || !formData.slug || !formData.content || !formData.excerpt) {
      toast.error('Please fill in all required fields');
      return;
    }
    saveBlogMutation.mutate(formData);
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${isDarkMode ? 'bg-dark-900 text-dark-text-primary' : 'bg-light-50 text-light-text-primary'}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-orange"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900 text-dark-text-primary' : 'bg-light-50 text-light-text-primary'}`}>
      {/* Header */}
      <div className={`sticky top-0 z-10 border-b ${isDarkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/blogs')}
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-dark-700' : 'hover:bg-gray-100'}`}
              >
                <Icon icon={Icons.FiArrowLeft} className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold">
                {isEditing ? 'Edit Blog' : 'Create New Blog'}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handlePreview}
                className={`px-4 py-2 border rounded-lg transition-colors ${
                  isPreviewMode
                    ? 'bg-accent-orange text-white border-accent-orange'
                    : isDarkMode
                    ? 'border-dark-600 hover:bg-dark-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon icon={Icons.FiEye} className="w-4 h-4 mr-2 inline" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </button>

              <button
                onClick={handleSave}
                disabled={saveBlogMutation.isPending}
                className="bg-accent-orange hover:bg-accent-orange-hover text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saveBlogMutation.isPending ? (
                  <Icon icon={Icons.FiLoader} className="w-4 h-4 mr-2 inline animate-spin" />
                ) : (
                  <Icon icon={Icons.FiSave} className="w-4 h-4 mr-2 inline" />
                )}
                {isEditing ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isPreviewMode ? (
          /* Preview Mode */
          <div className={`rounded-lg shadow-sm ${isDarkMode ? 'bg-dark-800' : 'bg-white'} p-8`}>
            <article className="prose prose-lg max-w-none">
              {formData.featured_image && (
                <img
                  src={formData.featured_image}
                  alt={formData.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              <header className="mb-8">
                <h1 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
                  {formData.title || 'Blog Title'}
                </h1>

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Draft Preview</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString()}</span>
                  {formData.featured && (
                    <>
                      <span>•</span>
                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Featured</span>
                    </>
                  )}
                </div>

                {formData.excerpt && (
                  <p className={`text-xl mt-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                    {formData.excerpt}
                  </p>
                )}
              </header>

              <div
                className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}
                dangerouslySetInnerHTML={{ __html: formData.content || '<p>Start writing your blog content...</p>' }}
              />
            </article>
          </div>
        ) : (
          /* Edit Mode */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className={`rounded-lg shadow-sm ${isDarkMode ? 'bg-dark-800' : 'bg-white'} p-6`}>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Enter blog title"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Slug *</label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="blog-url-slug"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Excerpt *</label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Brief description of the blog post"
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Featured Image URL</label>
                    <input
                      type="url"
                      value={formData.featured_image}
                      onChange={(e) => handleInputChange('featured_image', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    {formData.featured_image && (
                      <img
                        src={formData.featured_image}
                        alt="Preview"
                        className="mt-2 w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className={`rounded-lg shadow-sm ${isDarkMode ? 'bg-dark-800' : 'bg-white'} p-6`}>
                <h2 className="text-lg font-semibold mb-4">Content *</h2>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Write your blog content here... (HTML supported)"
                  rows={20}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange font-mono text-sm ${
                    isDarkMode
                      ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  You can use HTML tags for formatting. For example: &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className={`rounded-lg shadow-sm ${isDarkMode ? 'bg-dark-800' : 'bg-white'} p-6`}>
                <h2 className="text-lg font-semibold mb-4">Publish Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value as BlogFormData['status'])}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => handleInputChange('featured', e.target.checked)}
                      className="w-4 h-4 text-accent-orange border-gray-300 rounded focus:ring-accent-orange"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm font-medium">
                      Featured Blog
                    </label>
                  </div>
                </div>
              </div>

              {/* Categories & Tags */}
              <div className={`rounded-lg shadow-sm ${isDarkMode ? 'bg-dark-800' : 'bg-white'} p-6`}>
                <h2 className="text-lg font-semibold mb-4">Categories & Tags</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Categories</label>
                    <input
                      type="text"
                      value={formData.categories}
                      onChange={(e) => handleInputChange('categories', e.target.value)}
                      placeholder="travel, adventure, culture (comma separated)"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="vietnam, tour, guide (comma separated)"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* SEO Settings */}
              <div className={`rounded-lg shadow-sm ${isDarkMode ? 'bg-dark-800' : 'bg-white'} p-6`}>
                <h2 className="text-lg font-semibold mb-4">SEO Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Title</label>
                    <input
                      type="text"
                      value={formData.seo_meta_title}
                      onChange={(e) => handleInputChange('seo_meta_title', e.target.value)}
                      placeholder="SEO title for search engines"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Description</label>
                    <textarea
                      value={formData.seo_meta_description}
                      onChange={(e) => handleInputChange('seo_meta_description', e.target.value)}
                      placeholder="Description for search engines"
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Keywords</label>
                    <input
                      type="text"
                      value={formData.seo_keywords}
                      onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                      placeholder="keyword1, keyword2, keyword3"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;

