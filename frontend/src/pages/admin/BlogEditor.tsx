import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '../../contexts/TranslationContext';
import RichTextEditor from '../../components/common/RichTextEditor';
import ImageUpload from '../../components/admin/ImageUpload';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import toast from 'react-hot-toast';

interface BlogFormData {
  title: string;
  title_vi: string;
  slug: string;
  excerpt: string;
  excerpt_vi: string;
  content: string;
  content_vi: string;
  featured_image: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  categories: string;
  tags: string;
  language: string;
  seo_meta_title: string;
  seo_meta_title_vi: string;
  seo_meta_description: string;
  seo_meta_description_vi: string;
  seo_keywords: string;
}

interface Blog {
  id: number;
  title: string;
  title_vi?: string;
  slug: string;
  content: string;
  content_vi?: string;
  excerpt: string;
  excerpt_vi?: string;
  featured_image?: string;
  author: number;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  categories?: string;
  tags?: string;
  language: string;
  views: number;
  seo_meta_title?: string;
  seo_meta_title_vi?: string;
  seo_meta_description?: string;
  seo_meta_description_vi?: string;
  created_at: string;
  updated_at: string;
}

interface BlogEditorProps {
  blog: Blog | null;
  onClose: () => void;
  onSave: () => void;
}

const BlogEditor: React.FC<BlogEditorProps> = ({ blog, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const isEditing = !!blog;

  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [currentLanguage, setCurrentLanguage] = useState<'en' | 'vi'>('en');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [formData, setFormData] = useState<BlogFormData>({
    title: '',
    title_vi: '',
    slug: '',
    excerpt: '',
    excerpt_vi: '',
    content: '',
    content_vi: '',
    featured_image: '',
    status: 'draft',
    featured: false,
    categories: '',
    tags: '',
    language: 'en',
    seo_meta_title: '',
    seo_meta_title_vi: '',
    seo_meta_description: '',
    seo_meta_description_vi: '',
    seo_keywords: ''
  });

  // Populate form when editing
  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || '',
        title_vi: blog.title_vi || '',
        slug: blog.slug || '',
        excerpt: blog.excerpt || '',
        excerpt_vi: blog.excerpt_vi || '',
        content: blog.content || '',
        content_vi: blog.content_vi || '',
        featured_image: blog.featured_image || '',
        status: blog.status || 'draft',
        featured: blog.featured || false,
        categories: blog.categories || '',
        tags: blog.tags || '',
        language: blog.language || 'en',
        seo_meta_title: blog.seo_meta_title || '',
        seo_meta_title_vi: blog.seo_meta_title_vi || '',
        seo_meta_description: blog.seo_meta_description || '',
        seo_meta_description_vi: blog.seo_meta_description_vi || '',
        seo_keywords: blog.tags || ''
      });
      setCurrentLanguage(blog.language as 'en' | 'vi' || 'en');
    }
  }, [blog]);

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
  const handleTitleChange = (title: string, lang: 'en' | 'vi' = 'en') => {
    const updates: Partial<BlogFormData> = {};

    if (lang === 'en') {
      updates.title = title;
      if (!isEditing || !formData.slug) {
        updates.slug = generateSlug(title);
      }
    } else {
      updates.title_vi = title;
    }

    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Handle featured image upload
  const handleFeaturedImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, featured_image: imageUrl }));
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof BlogFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Create/Update blog mutation
  const saveBlogMutation = useMutation({
    mutationFn: async (data: BlogFormData) => {
      const url = isEditing
        ? `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/blogs/admin/${blog!.id}`
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/blogs/admin`;

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...data,
          categories: data.categories ? data.categories.split(',').map(c => c.trim()) : [],
          tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
          seoData: {
            title: data.seo_meta_title,
            description: data.seo_meta_description,
            keywords: data.seo_keywords
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save blog');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(isEditing ? t('Blog updated successfully') : t('Blog created successfully'));
      onSave();
    },
    onError: (error: Error) => {
      toast.error(error.message || t('Failed to save blog'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error(t('Title is required'));
      return;
    }
    if (!formData.content.trim()) {
      toast.error(t('Content is required'));
      return;
    }
    if (!formData.excerpt.trim()) {
      toast.error(t('Excerpt is required'));
      return;
    }

    saveBlogMutation.mutate(formData);
  };

  const getCurrentContent = () => {
    return currentLanguage === 'en' ? formData.content : formData.content_vi;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
            >
              <Icon icon={Icons.FiArrowLeft} className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? t('Edit Blog') : t('Create Blog')}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isEditing ? t('Update your blog post') : t('Create a new blog post')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Toggle */}
            <div className="flex items-center rounded-lg p-1 bg-gray-100 dark:bg-dark-700">
              <button
                onClick={() => setCurrentLanguage('en')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentLanguage === 'en'
                    ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setCurrentLanguage('vi')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentLanguage === 'vi'
                    ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                VI
              </button>
            </div>

            {/* Preview Toggle */}
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`px-4 py-2 rounded-lg border flex items-center space-x-2 transition-colors ${
                isPreviewMode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-dark-700 border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-600'
              }`}
            >
              <Icon icon={Icons.FiEye} className="h-4 w-4" />
              <span>{isPreviewMode ? t('Edit') : t('Preview')}</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              disabled={saveBlogMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              {saveBlogMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Icon icon={Icons.FiSave} className="h-4 w-4" />
              )}
              <span>{isEditing ? t('Update') : t('Create')}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mt-4">
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'content'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t('Content')}
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`pb-2 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'seo'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t('SEO & Settings')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1">
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('Basic Information')} ({currentLanguage === 'en' ? 'English' : 'Tiếng Việt'})
                </h2>

                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Title')} *
                    </label>
                    <input
                      type="text"
                      value={currentLanguage === 'en' ? formData.title : formData.title_vi}
                      onChange={(e) => handleTitleChange(e.target.value, currentLanguage)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('Enter blog title')}
                      required
                    />
                  </div>

                  {/* Slug (only for English) */}
                  {currentLanguage === 'en' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('URL Slug')} *
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => handleFieldChange('slug', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('url-slug-format')}
                        required
                      />
                    </div>
                  )}

                  {/* Excerpt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Excerpt')} *
                    </label>
                    <textarea
                      value={currentLanguage === 'en' ? formData.excerpt : formData.excerpt_vi}
                      onChange={(e) => handleFieldChange(currentLanguage === 'en' ? 'excerpt' : 'excerpt_vi', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder={t('Brief description of your blog post')}
                      required
                    />
                  </div>

                  {/* Content with Image URL support */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Content')} *
                    </label>
                    {!isPreviewMode ? (
                      <div className="min-h-96">
                        <RichTextEditor
                          value={currentLanguage === 'en' ? formData.content : formData.content_vi}
                          onChange={(value) => handleFieldChange(currentLanguage === 'en' ? 'content' : 'content_vi', value)}
                          placeholder={t('Write your blog content here...')}
                          height={384}
                        />
                      </div>
                    ) : (
                      <div className="min-h-96 p-4 border border-gray-300 dark:border-dark-600 rounded-lg bg-gray-50 dark:bg-dark-700">
                        <div className={`prose prose-lg max-w-none ${
                          isDarkMode 
                            ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-gray-300 prose-pre:bg-gray-800 prose-blockquote:border-blue-500 prose-blockquote:text-gray-300' 
                            : 'prose-gray prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-blockquote:border-blue-500'
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
                                  className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors duration-200`}
                                >
                                  {children}
                                </a>
                              ),
                              h1: ({ children }) => (
                                <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-8 mb-4`}>
                                  {children}
                                </h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-6 mb-3`}>
                                  {children}
                                </h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-5 mb-2`}>
                                  {children}
                                </h3>
                              ),
                              h4: ({ children }) => (
                                <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-4 mb-2`}>
                                  {children}
                                </h4>
                              ),
                              h5: ({ children }) => (
                                <h5 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-3 mb-2`}>
                                  {children}
                                </h5>
                              ),
                              h6: ({ children }) => (
                                <h6 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-3 mb-2`}>
                                  {children}
                                </h6>
                              ),
                              p: ({ children }) => (
                                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>
                                  {children}
                                </p>
                              ),
                              blockquote: ({ children }) => (
                                <blockquote className={`border-l-4 ${isDarkMode ? 'border-blue-500 bg-gray-800' : 'border-blue-500 bg-gray-50'} pl-4 py-2 my-6 italic`}>
                                  <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                                    {children}
                                  </div>
                                </blockquote>
                              ),
                              ul: ({ children }) => (
                                <ul className={`list-disc list-inside mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {children}
                                </ul>
                              ),
                              ol: ({ children }) => (
                                <ol className={`list-decimal list-inside mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {children}
                                </ol>
                              ),
                              li: ({ children }) => (
                                <li className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {children}
                                </li>
                              ),
                              code: ({ inline, children }: any) => (
                                inline ? (
                                  <code className={`px-1 py-0.5 rounded text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                                    {children}
                                  </code>
                                ) : (
                                  <code className={`block p-4 rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                                    {children}
                                  </code>
                                )
                              ),
                              pre: ({ children }) => (
                                <pre className={`p-4 rounded-lg overflow-x-auto mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                  {children}
                                </pre>
                              ),
                              table: ({ children }) => (
                                <div className="overflow-x-auto mb-4">
                                  <table className={`min-w-full border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                                    {children}
                                  </table>
                                </div>
                              ),
                              th: ({ children }) => (
                                <th className={`border px-4 py-2 text-left font-semibold ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'}`}>
                                  {children}
                                </th>
                              ),
                              td: ({ children }) => (
                                <td className={`border px-4 py-2 ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                                  {children}
                                </td>
                              ),
                              strong: ({ children }) => (
                                <strong className={isDarkMode ? 'text-white font-bold' : 'text-gray-900 font-bold'}>
                                  {children}
                                </strong>
                              ),
                              em: ({ children }) => (
                                <em className={isDarkMode ? 'text-gray-300 italic' : 'text-gray-700 italic'}>
                                  {children}
                                </em>
                              ),
                            }}
                          >
                            {getCurrentContent() || t('No content')}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings (only show for English) */}
              {currentLanguage === 'en' && (
                <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('Settings')}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Status')}
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleFieldChange('status', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="draft">{t('Draft')}</option>
                        <option value="published">{t('Published')}</option>
                        <option value="archived">{t('Archived')}</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('Primary Language')}
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => handleFieldChange('language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="en">{t('English')}</option>
                        <option value="vi">{t('Vietnamese')}</option>
                      </select>
                    </div>
                  </div>

                  {/* Featured checkbox */}
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => handleFieldChange('featured', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {t('Featured Blog')}
                      </span>
                    </label>
                  </div>

                  {/* Featured Image Upload */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Featured Image')}
                    </label>
                    <ImageUpload
                      onImageUploaded={handleFeaturedImageUploaded}
                      currentImage={formData.featured_image}
                      uploadType="featured"
                      className="w-full"
                    />
                  </div>

                  {/* Categories */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Categories')}
                    </label>
                    <input
                      type="text"
                      value={formData.categories}
                      onChange={(e) => handleFieldChange('categories', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('Travel, Adventure, Culture (comma separated)')}
                    />
                  </div>

                  {/* Tags */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Tags')}
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleFieldChange('tags', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('vietnam, travel, food, culture (comma separated)')}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('Preview')} ({currentLanguage === 'en' ? 'English' : 'Tiếng Việt'})
                </h2>

                {/* Featured Image Preview */}
                {formData.featured_image && (
                  <div className="mb-4">
                    <img
                      src={formData.featured_image}
                      alt="Featured"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Title Preview */}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {currentLanguage === 'en' ? formData.title : formData.title_vi || t('No title')}
                </h3>

                {/* Excerpt Preview */}
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                  {currentLanguage === 'en' ? formData.excerpt : formData.excerpt_vi || t('No excerpt')}
                </p>

                {/* Content Preview with Image Support */}
                <div className={`prose prose-lg max-w-none ${
                  isDarkMode 
                    ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-gray-300 prose-pre:bg-gray-800 prose-blockquote:border-blue-500 prose-blockquote:text-gray-300' 
                    : 'prose-gray prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-blockquote:border-blue-500'
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
                          className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors duration-200`}
                        >
                          {children}
                        </a>
                      ),
                      h1: ({ children }) => (
                        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-8 mb-4`}>
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-6 mb-3`}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-5 mb-2`}>
                          {children}
                        </h3>
                      ),
                      h4: ({ children }) => (
                        <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-4 mb-2`}>
                          {children}
                        </h4>
                      ),
                      h5: ({ children }) => (
                        <h5 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-3 mb-2`}>
                          {children}
                        </h5>
                      ),
                      h6: ({ children }) => (
                        <h6 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-3 mb-2`}>
                          {children}
                        </h6>
                      ),
                      p: ({ children }) => (
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>
                          {children}
                        </p>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className={`border-l-4 ${isDarkMode ? 'border-blue-500 bg-gray-800' : 'border-blue-500 bg-gray-50'} pl-4 py-2 my-6 italic`}>
                          <div className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                            {children}
                          </div>
                        </blockquote>
                      ),
                      ul: ({ children }) => (
                        <ul className={`list-disc list-inside mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className={`list-decimal list-inside mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className={`mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {children}
                        </li>
                      ),
                      code: ({ inline, children }: any) => (
                        inline ? (
                          <code className={`px-1 py-0.5 rounded text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                            {children}
                          </code>
                        ) : (
                          <code className={`block p-4 rounded-lg text-sm ${isDarkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                            {children}
                          </code>
                        )
                      ),
                      pre: ({ children }) => (
                        <pre className={`p-4 rounded-lg overflow-x-auto mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                          {children}
                        </pre>
                      ),
                      table: ({ children }) => (
                        <div className="overflow-x-auto mb-4">
                          <table className={`min-w-full border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'}`}>
                            {children}
                          </table>
                        </div>
                      ),
                      th: ({ children }) => (
                        <th className={`border px-4 py-2 text-left font-semibold ${isDarkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300 bg-gray-50 text-gray-900'}`}>
                          {children}
                        </th>
                      ),
                      td: ({ children }) => (
                        <td className={`border px-4 py-2 ${isDarkMode ? 'border-gray-700 text-gray-300' : 'border-gray-300 text-gray-700'}`}>
                          {children}
                        </td>
                      ),
                      strong: ({ children }) => (
                        <strong className={isDarkMode ? 'text-white font-bold' : 'text-gray-900 font-bold'}>
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className={isDarkMode ? 'text-gray-300 italic' : 'text-gray-700 italic'}>
                          {children}
                        </em>
                      ),
                    }}
                  >
                    {getCurrentContent() || t('No content')}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Image Guidelines */}
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-4`}>
                <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  📷 {t('Image Guidelines')}
                </h3>
                <ul className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} space-y-1`}>
                  <li>• {t('Featured image: Recommended 1200x630px for best social media sharing')}</li>
                  <li>• {t('Content images: Will be automatically optimized and stored in R2')}</li>
                  <li>• {t('Supported formats: JPEG, PNG, WebP (max 5MB each)')}</li>
                  <li>• {t('Images in content support markdown: ![alt text](url)')}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="p-6">
            {/* SEO Tab Content */}
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('SEO Settings')} ({currentLanguage === 'en' ? 'English' : 'Tiếng Việt'})
                </h2>

                <div className="space-y-4">
                  {/* SEO Meta Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Meta Title')}
                    </label>
                    <input
                      type="text"
                      value={currentLanguage === 'en' ? formData.seo_meta_title : formData.seo_meta_title_vi}
                      onChange={(e) => handleFieldChange(currentLanguage === 'en' ? 'seo_meta_title' : 'seo_meta_title_vi', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('SEO optimized title (recommended: 50-60 characters)')}
                      maxLength={60}
                    />
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      {(currentLanguage === 'en' ? formData.seo_meta_title : formData.seo_meta_title_vi).length}/60 {t('characters')}
                    </p>
                  </div>

                  {/* SEO Meta Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Meta Description')}
                    </label>
                    <textarea
                      value={currentLanguage === 'en' ? formData.seo_meta_description : formData.seo_meta_description_vi}
                      onChange={(e) => handleFieldChange(currentLanguage === 'en' ? 'seo_meta_description' : 'seo_meta_description_vi', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder={t('Brief description for search engines (recommended: 150-160 characters)')}
                      maxLength={160}
                    />
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      {(currentLanguage === 'en' ? formData.seo_meta_description : formData.seo_meta_description_vi).length}/160 {t('characters')}
                    </p>
                  </div>

                  {/* SEO Keywords (only for English) */}
                  {currentLanguage === 'en' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('SEO Keywords')}
                      </label>
                      <input
                        type="text"
                        value={formData.seo_keywords}
                        onChange={(e) => handleFieldChange('seo_keywords', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('travel, vietnam, culture, adventure (comma separated)')}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* SEO Preview */}
              <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t('Search Engine Preview')}
                </h3>
                <div className="border rounded-lg p-4">
                  <div className="text-blue-600 hover:underline cursor-pointer text-lg">
                    {(currentLanguage === 'en' ? formData.seo_meta_title : formData.seo_meta_title_vi) || (currentLanguage === 'en' ? formData.title : formData.title_vi) || t('Your blog title')}
                  </div>
                  <div className="text-green-700 text-sm mt-1">
                    {window.location.origin}/blog/{formData.slug || 'your-blog-slug'}
                  </div>
                  <div className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                    {(currentLanguage === 'en' ? formData.seo_meta_description : formData.seo_meta_description_vi) || (currentLanguage === 'en' ? formData.excerpt : formData.excerpt_vi) || t('Your blog description will appear here...')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default BlogEditor;

