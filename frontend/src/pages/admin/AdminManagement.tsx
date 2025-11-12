import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { adminAPI_functions } from '../../utils/api';

interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin';
  computed_role: 'super_admin' | 'admin';
  is_super_admin: number;
  is_active: number;
  created_at: string;
  created_by: number | null;
}

interface NewAdmin {
  name: string;
  email: string;
  phone: string;
}

const AdminManagement: React.FC = () => {
  const { state } = useAuth();
  const { isDarkMode } = useTheme();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState<NewAdmin>({
    name: '',
    email: '',
    phone: ''
  });

  const isSuperAdmin = state.admin?.role === 'super_admin';

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI_functions.getAllAdmins();
      setAdmins(response.data.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch admins');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccess('');

      await adminAPI_functions.createAdmin(newAdmin);

      setSuccess('Admin created successfully! Invitation email sent.');
      setShowCreateModal(false);
      setNewAdmin({ name: '', email: '', phone: '' });
      fetchAdmins();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create admin');
    }
  };

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    try {
      setError('');
      setSuccess('');

      await adminAPI_functions.updateAdmin(selectedAdmin.id, {
        name: selectedAdmin.name,
        email: selectedAdmin.email,
        phone: selectedAdmin.phone,
        is_active: selectedAdmin.is_active
      });

      setSuccess('Admin updated successfully!');
      setShowEditModal(false);
      setSelectedAdmin(null);
      fetchAdmins();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    if (!window.confirm('Are you sure you want to delete this admin? They will no longer be able to access the system.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await adminAPI_functions.deleteAdmin(adminId);

      setSuccess('Admin deleted successfully!');
      fetchAdmins();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete admin');
    }
  };

  const handleResetPassword = async (adminId: number, adminName: string) => {
    if (!window.confirm(`Reset password for ${adminName}? A new password will be sent to their email.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await adminAPI_functions.resetAdminPassword(adminId);

      setSuccess('Password reset successfully! Email sent to admin.');

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleToggleActive = async (admin: Admin) => {
    try {
      setError('');
      setSuccess('');

      await adminAPI_functions.updateAdmin(admin.id, {
        is_active: admin.is_active === 1 ? 0 : 1
      });

      setSuccess(`Admin ${admin.is_active === 1 ? 'deactivated' : 'activated'} successfully!`);
      fetchAdmins();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update admin status');
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`${isDarkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded`}>
          <p className="font-bold">Access Denied</p>
          <p>Only Super Admins can access this page.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Loading admins...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + Create New Admin
        </button>
      </div>

      {error && (
        <div className={`${isDarkMode ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700'} border px-4 py-3 rounded mb-4`}>
          {error}
        </div>
      )}

      {success && (
        <div className={`${isDarkMode ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-700'} border px-4 py-3 rounded mb-4`}>
          {success}
        </div>
      )}

      <div className={`${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-md rounded-lg overflow-hidden`}>
        <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-700">
          <thead className={isDarkMode ? 'bg-dark-700' : 'bg-gray-50'}>
            <tr>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Name</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Email</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Phone</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Role</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Status</th>
              <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Created</th>
              <th className={`px-6 py-3 text-right text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>Actions</th>
            </tr>
          </thead>
          <tbody className={`${isDarkMode ? 'bg-dark-800 divide-dark-700' : 'bg-white divide-gray-200'} divide-y`}>
            {admins.map((admin) => (
              <tr key={admin.id} className={admin.is_active === 0 ? (isDarkMode ? 'bg-dark-700 opacity-60' : 'bg-gray-50 opacity-60') : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{admin.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{admin.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{admin.phone || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    admin.computed_role === 'super_admin' 
                      ? (isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-100 text-purple-800')
                      : (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                  }`}>
                    {admin.computed_role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    admin.is_active === 1 
                      ? (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                      : (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                  }`}>
                    {admin.is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                  {new Date(admin.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {admin.is_super_admin !== 1 && (
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => { setSelectedAdmin(admin); setShowEditModal(true); }} className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-900'}`}>Edit</button>
                      <button onClick={() => handleToggleActive(admin)} className={`${admin.is_active === 1 ? (isDarkMode ? 'text-orange-400 hover:text-orange-300' : 'text-orange-600 hover:text-orange-900') : (isDarkMode ? 'text-green-400 hover:text-green-300' : 'text-green-600 hover:text-green-900')}`}>
                        {admin.is_active === 1 ? 'Deactivate' : 'Activate'}
                      </button>
                      <button onClick={() => handleResetPassword(admin.id, admin.name)} className={`${isDarkMode ? 'text-yellow-400 hover:text-yellow-300' : 'text-yellow-600 hover:text-yellow-900'}`}>Reset Password</button>
                      <button onClick={() => handleDeleteAdmin(admin.id)} className={`${isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-900'}`}>Delete</button>
                    </div>
                  )}
                  {admin.is_super_admin === 1 && <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} italic`}>Protected</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-dark-800 text-white' : 'bg-white'} rounded-lg p-8 max-w-md w-full`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Create New Admin</h2>
            <form onSubmit={handleCreateAdmin}>
              <div className="mb-4">
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Name *</label>
                <input type="text" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} required />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Email *</label>
                <input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} required />
              </div>
              <div className="mb-6">
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Phone</label>
                <input type="tel" value={newAdmin.phone} onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
              </div>
              <div className={`${isDarkMode ? 'bg-blue-900 border-blue-700 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-700'} border px-4 py-3 rounded mb-4`}>
                <p className="text-sm"><strong>Note:</strong> An invitation email with auto-generated password will be sent to the admin.</p>
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => { setShowCreateModal(false); setNewAdmin({ name: '', email: '', phone: '' }); }} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-200 bg-dark-700 hover:bg-dark-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'}`}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Create Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${isDarkMode ? 'bg-dark-800 text-white' : 'bg-white'} rounded-lg p-8 max-w-md w-full`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Edit Admin</h2>
            <form onSubmit={handleUpdateAdmin}>
              <div className="mb-4">
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Name *</label>
                <input type="text" value={selectedAdmin.name} onChange={(e) => setSelectedAdmin({ ...selectedAdmin, name: e.target.value })} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} required />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Email *</label>
                <input type="email" value={selectedAdmin.email} onChange={(e) => setSelectedAdmin({ ...selectedAdmin, email: e.target.value })} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} required />
              </div>
              <div className="mb-6">
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>Phone</label>
                <input type="tel" value={selectedAdmin.phone || ''} onChange={(e) => setSelectedAdmin({ ...selectedAdmin, phone: e.target.value })} className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500 ${isDarkMode ? 'bg-dark-700 border-dark-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`} />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedAdmin(null); }} className={`px-4 py-2 rounded-lg ${isDarkMode ? 'text-gray-200 bg-dark-700 hover:bg-dark-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'}`}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;

