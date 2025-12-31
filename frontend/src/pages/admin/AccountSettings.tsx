import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const AccountSettings: React.FC = () => {
  const { state } = useAuth();
  const admin = state.admin;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-dark-800 shadow-md rounded-lg overflow-hidden">
        {/* Header */}
        <div className="border-b dark:border-dark-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dark-700 dark:to-dark-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage your account information
          </p>
        </div>

        {/* Account Information */}
        <div className="p-6 space-y-6">
          {/* Profile Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Profile Information
            </h3>
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <div className="px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-md text-gray-900 dark:text-white">
                    {admin?.name || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-md text-gray-900 dark:text-white">
                    {admin?.email || 'N/A'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <div className="px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-md">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      admin?.role === 'super_admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                    }`}>
                      {admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <div className="px-4 py-3 bg-white dark:bg-dark-800 border border-gray-300 dark:border-dark-600 rounded-md text-gray-900 dark:text-white">
                    {admin?.phone || 'Not set'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Security
            </h3>
            <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Password
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Last changed: Recently
                  </p>
                </div>
                <button
                  onClick={() => {
                    toast.success('Use the "Change Password" tab in the sidebar');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Account Status
            </h3>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-green-800 dark:text-green-300">
                    Account Active
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Your account is active and in good standing
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Information Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Need to update your information?
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                  {admin?.role === 'super_admin'
                    ? 'As a super admin, you can update your information. Contact the system administrator if you need to change your email.'
                    : 'Contact a super administrator to update your account information.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;

