import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Icon, Icons } from '../../components/common/Icons';
import { useTheme } from '../../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  author: number;
  author_name: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  categories?: string;
  tags?: string;
  views: number;
  created_at: string;
  updated_at: string;
}

const BlogManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'normal'>('all');
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch blogs
  const { data: blogsData, isLoading } = useQuery({
    queryKey: ['admin-blogs', searchTerm, filterStatus, filterFeatured],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterFeatured !== 'all') params.append('featured', filterFeatured === 'featured' ? 'true' : 'false');

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/blogs?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
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
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/blogs/${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      if (!response.ok) throw new Error('Failed to delete blog');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Blog deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete blog');
    }
  });

  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ blogId, featured }: { blogId: number; featured: boolean }) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/blogs/${blogId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured })
      });
      if (!response.ok) throw new Error('Failed to update blog');
      return response.json();
    },
    onSuccess: () => {
      toast.success('Blog featured status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update blog');
    }
  });

  const handleDelete = (blogId: number) => {
    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      deleteBlogMutation.mutate(blogId);
    }
  };

  const handleToggleFeatured = (blogId: number, currentFeatured: boolean) => {
    toggleFeaturedMutation.mutate({ blogId, featured: !currentFeatured });
  };

  const handleEdit = (blogId: number) => {
    navigate(`/admin/blogs/edit/${blogId}`);
  };

  const handlePreview = (slug: string) => {
    window.open(`/blog/${slug}`, '_blank');
  };

  const blogs: Blog[] = blogsData?.data?.blogs || [];

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
    <div className={`p-6 ${isDarkMode ? 'bg-dark-900 text-dark-text-primary' : 'bg-light-50 text-light-text-primary'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
            Manage your travel blog posts and articles
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/blogs/new')}
          className="bg-accent-orange hover:bg-accent-orange-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <Icon icon={Icons.FiPlus} className="w-4 h-4" />
          <span>Create New Blog</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search blogs..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                isDarkMode
                  ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                isDarkMode
                  ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Featured</label>
            <select
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value as any)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                isDarkMode
                  ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Blogs</option>
              <option value="featured">Featured Only</option>
              <option value="normal">Non-Featured</option>
            </select>
          </div>
        </div>
      </div>

      {/* Blog List */}
      <div className={`rounded-lg shadow-sm overflow-hidden ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
        <table className="w-full">
          <thead className={`${isDarkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className={`divide-y ${isDarkMode ? 'divide-dark-700' : 'divide-gray-200'}`}>
            {blogs.map((blog) => (
              <tr key={blog.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {blog.featured_image && (
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                    )}
                    <div>
                      <div className="text-sm font-medium">{blog.title}</div>
                      <div className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                        {blog.excerpt?.substring(0, 60)}...
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    blog.status === 'published'
                      ? 'bg-green-100 text-green-800'
                      : blog.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {blog.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleFeatured(blog.id, blog.featured)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      blog.featured
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : isDarkMode
                        ? 'bg-dark-700 text-dark-text-muted hover:bg-dark-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Icon icon={blog.featured ? Icons.FiStar : Icons.FiStar} className="w-3 h-3" />
                    <span>{blog.featured ? 'Featured' : 'Normal'}</span>
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {blog.views}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {blog.author_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {new Date(blog.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePreview(blog.slug)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Preview"
                    >
                      <Icon icon={Icons.FiEye} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(blog.id)}
                      className="text-accent-orange hover:text-accent-orange-hover"
                      title="Edit"
                    >
                      <Icon icon={Icons.FiEdit} className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {blogs.length === 0 && (
          <div className="px-6 py-8 text-center">
            <Icon icon={Icons.FiFileText} className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
              No blogs found
            </p>
            <p className={`mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
              {searchTerm || filterStatus !== 'all' || filterFeatured !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first blog post.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogManagement;
