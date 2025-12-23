import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
import { useTranslation } from '../../contexts/TranslationContext';
import toast from 'react-hot-toast';
import BlogEditor from './BlogEditor';

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

const BlogManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'normal'>('all');
  const [filterLanguage] = useState<'all' | 'en' | 'vi'>('all');
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentDisplayLanguage] = useState<'en' | 'vi' | 'both'>('both'); // Add display language toggle
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();

  // Fetch blogs with language support
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['admin-blogs', searchTerm, filterStatus, filterFeatured, filterLanguage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterFeatured !== 'all') params.append('featured', filterFeatured === 'featured' ? 'true' : 'false');
      if (filterLanguage !== 'all') params.append('language', filterLanguage);

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/blogs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch blogs');
      return response.json();
    }
  });

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: async (blogId: number) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        }
      });
      if (!response.ok) throw new Error('Failed to delete blog');
      return response.json();
    },
    onSuccess: () => {
      toast.success(t('Blog deleted successfully'));
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t('Failed to delete blog'));
    }
  });

  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ blogId, featured }: { blogId: number; featured: boolean }) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update blog');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(t('Blog featured status updated'));
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
    },
    onError: (error: Error) => {
      console.error('Featured toggle error:', error);
      toast.error(error.message || t('Failed to update blog'));
    }
  });

  // Update blog status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ blogId, status }: { blogId: number; status: string }) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/blogs/${blogId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(t('Blog status updated'));
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || t('Failed to update status'));
    }
  });

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingBlog(null);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setEditingBlog(null);
  };

  const handleDelete = (blog: Blog) => {
    if (window.confirm(t('Are you sure you want to delete this blog?'))) {
      deleteBlogMutation.mutate(blog.id);
    }
  };

  const handleToggleFeatured = (blog: Blog) => {
    toggleFeaturedMutation.mutate({ blogId: blog.id, featured: !blog.featured });
  };

  const handleStatusChange = (blog: Blog, status: string) => {
    updateStatusMutation.mutate({ blogId: blog.id, status });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.draft;
  };

  const blogs = blogsData?.data?.blogs || [];

  if (isEditorOpen) {
    return (
      <BlogEditor
        blog={editingBlog}
        onClose={handleCloseEditor}
        onSave={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
          handleCloseEditor();
        }}
      />
    );
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-dark-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('Blog Management')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('Manage your blog posts and content')}
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Icon icon={Icons.FiPlus} className="h-4 w-4" />
          <span>{t('Create Blog')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Icon icon={Icons.FiSearch} className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
                type="text"
                placeholder={t('Search blogs...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('All Status')}</option>
            <option value="published">{t('Published')}</option>
            <option value="draft">{t('Draft')}</option>
            <option value="archived">{t('Archived')}</option>
          </select>

          {/* Featured Filter */}
          <select
            value={filterFeatured}
            onChange={(e) => setFilterFeatured(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">{t('All Blogs')}</option>
            <option value="featured">{t('Featured')}</option>
            <option value="normal">{t('Normal')}</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Blogs Table */}
      {!isLoading && (
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('Blog')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('Status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('Author')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    {t('Date')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                    {t('Actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {blogs.map((blog: Blog) => (
                  <tr key={blog.id} className="hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {blog.featured_image && (
                          <img
                            src={blog.featured_image}
                            alt={blog.title}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {/* Enhanced bilingual title display */}
                              {currentDisplayLanguage === 'both' ? (
                                <div className="space-y-1">
                                  <div className="flex items-center">
                                    <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded mr-2">EN</span>
                                    <span>{blog.title}</span>
                                  </div>
                                  {blog.title_vi && (
                                    <div className="flex items-center">
                                      <span className="text-xs bg-red-100 text-red-800 px-1 rounded mr-2">VI</span>
                                      <span>{blog.title_vi}</span>
                                    </div>
                                  )}
                                </div>
                              ) : currentDisplayLanguage === 'vi' && blog.title_vi ? (
                                blog.title_vi
                              ) : (
                                blog.title
                              )}
                            </div>
                            {blog.featured && (
                              <Icon icon={Icons.FiStar} className="h-4 w-4 text-yellow-400 ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs mt-1">
                            {/* Enhanced bilingual excerpt display */}
                            {currentDisplayLanguage === 'both' ? (
                              <div className="space-y-1">
                                <div className="truncate">{blog.excerpt}</div>
                                {blog.excerpt_vi && (
                                  <div className="truncate text-xs">{blog.excerpt_vi}</div>
                                )}
                              </div>
                            ) : currentDisplayLanguage === 'vi' && blog.excerpt_vi ? (
                              blog.excerpt_vi
                            ) : (
                              blog.excerpt
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={blog.status}
                        onChange={(e) => handleStatusChange(blog, e.target.value)}
                        className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusBadge(blog.status)} dark:bg-opacity-20`}
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="draft">{t('Draft')}</option>
                        <option value="published">{t('Published')}</option>
                        <option value="archived">{t('Archived')}</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {blog.author_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(blog.created_at).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleFeatured(blog)}
                          className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-600 ${
                            blog.featured ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-400'
                          }`}
                          title={blog.featured ? t('Remove from featured') : t('Add to featured')}
                          disabled={toggleFeaturedMutation.isPending}
                        >
                          <Icon icon={Icons.FiStar} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(blog)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-600 text-gray-600 dark:text-gray-400"
                          title={t('Edit blog')}
                        >
                          <Icon icon={Icons.FiEdit2} className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(blog)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-600 text-red-600"
                          title={t('Delete blog')}
                          disabled={deleteBlogMutation.isPending}
                        >
                          <Icon icon={Icons.FiTrash2} className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {blogs.length === 0 && (
            <div className="text-center py-12">
              <Icon icon={Icons.FiFileText} className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {t('No blogs found')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t('Get started by creating your first blog post.')}
              </p>
              <button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {t('Create Blog')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
