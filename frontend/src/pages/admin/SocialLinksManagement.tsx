import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, Icons } from '../../components/common/Icons';
import toast from 'react-hot-toast';
import { socialLinksAPI } from '../../utils/api';

interface SocialLink {
    id: number;
    platform: 'facebook' | 'zalo' | 'email' | 'phone';
    url: string;
    display_text?: string;
    icon?: string;
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

const SocialLinksManagement: React.FC = () => {
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
    const { isDarkMode } = useTheme();

    const [formData, setFormData] = useState({
        platform: 'facebook' as 'facebook' | 'zalo' | 'email' | 'phone',
        url: '',
        display_text: '',
        is_active: true,
        sort_order: 0
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSocialLinks();
    }, []);

    const fetchSocialLinks = async () => {
        try {
            setIsLoading(true);
            const response = await socialLinksAPI.getAllSocialLinks();
            setSocialLinks(response.data.data);
        } catch (error: any) {
            console.error('Error fetching social links:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.');
                localStorage.removeItem('adminToken');
                // Redirect will be handled by the API interceptor
            } else {
                toast.error(error.response?.data?.message || 'Failed to fetch social links');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingLink) {
                await socialLinksAPI.updateSocialLink(editingLink.id.toString(), formData);
                toast.success('Social link updated successfully');
            } else {
                await socialLinksAPI.createSocialLink(formData);
                toast.success('Social link created successfully');
            }

            await fetchSocialLinks();
            resetForm();
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving social link:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to save social link');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this social link?')) {
            return;
        }

        try {
            await socialLinksAPI.deleteSocialLink(id.toString());
            toast.success('Social link deleted successfully');
            await fetchSocialLinks();
        } catch (error: any) {
            console.error('Error deleting social link:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please log in again.');
            } else {
                toast.error(error.response?.data?.message || 'Failed to delete social link');
            }
        }
    };

    const openModal = (link?: SocialLink) => {
        if (link) {
            setEditingLink(link);
            setFormData({
                platform: link.platform,
                url: link.url,
                display_text: link.display_text || '',
                is_active: link.is_active,
                sort_order: link.sort_order
            });
        } else {
            setEditingLink(null);
            setFormData({
                platform: 'facebook',
                url: '',
                display_text: '',
                is_active: true,
                sort_order: socialLinks.length
            });
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            platform: 'facebook',
            url: '',
            display_text: '',
            is_active: true,
            sort_order: 0
        });
        setEditingLink(null);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'facebook':
                return Icons.FiFacebook;
            case 'zalo':
                return Icons.FiMessageCircle;
            case 'email':
                return Icons.FiMail;
            case 'phone':
                return Icons.FiPhone;
            default:
                return Icons.FiMessageCircle;
        }
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
        <div className={`p-6 ${isDarkMode ? 'bg-dark-900 text-dark-text-primary' : 'bg-light-50 text-light-text-primary'}`}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Social Links Management</h1>
                <button
                    onClick={() => openModal()}
                    className="bg-accent-orange hover:bg-accent-orange-hover text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                    <Icon icon={Icons.FiPlus} className="w-4 h-4" />
                    <span>Add Social Link</span>
                </button>
            </div>

            {/* Social Links Table */}
            <div className={`rounded-lg shadow-sm overflow-hidden ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
                <table className="w-full">
                    <thead className={`${isDarkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Text</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-dark-700' : 'divide-gray-200'}`}>
                        {socialLinks.map((link) => (
                            <tr key={link.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <Icon icon={getPlatformIcon(link.platform)} className="w-5 h-5 mr-2" />
                                        <span className="capitalize">{link.platform}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="truncate max-w-xs block">{link.url}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {link.display_text || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        link.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {link.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {link.sort_order}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openModal(link)}
                                            className="text-accent-orange hover:text-accent-orange-hover"
                                        >
                                            <Icon icon={Icons.FiEdit} className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link.id)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <Icon icon={Icons.FiTrash2} className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {socialLinks.length === 0 && (
                    <div className="px-6 py-8 text-center">
                        <Icon icon={Icons.FiMessageCircle} className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className={`text-lg font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                            No social links configured
                        </p>
                        <p className={`mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
                            Get started by adding your first social media link.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className={`max-w-md w-full mx-4 rounded-lg shadow-xl ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">
                                {editingLink ? 'Edit Social Link' : 'Add Social Link'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Platform</label>
                                    <select
                                        value={formData.platform}
                                        onChange={(e) => setFormData({ ...formData, platform: e.target.value as any })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                                            isDarkMode
                                                ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                        required
                                    >
                                        <option value="facebook">Facebook</option>
                                        <option value="zalo">Zalo</option>
                                        <option value="email">Email</option>
                                        <option value="phone">Phone</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">URL/Contact</label>
                                    <input
                                        type="text"
                                        value={formData.url}
                                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                        placeholder="Enter URL, email, or phone number"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                                            isDarkMode
                                                ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Display Text</label>
                                    <input
                                        type="text"
                                        value={formData.display_text}
                                        onChange={(e) => setFormData({ ...formData, display_text: e.target.value })}
                                        placeholder="Text to show in tooltip"
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                                            isDarkMode
                                                ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Sort Order</label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) })}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                                            isDarkMode
                                                ? 'bg-dark-700 border-dark-600 text-dark-text-primary'
                                                : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                        min="0"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="h-4 w-4 text-accent-orange focus:ring-accent-orange border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm">
                                        Active
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className={`px-4 py-2 border rounded-lg transition-colors ${
                                        isDarkMode
                                            ? 'border-dark-600 text-dark-text-muted hover:bg-dark-700'
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-accent-orange hover:bg-accent-orange-hover text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : (editingLink ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SocialLinksManagement;
