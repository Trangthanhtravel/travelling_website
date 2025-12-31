import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
import { useAuth } from '../../contexts/AuthContext';
import TourManagement from './TourManagement';
import BlogManagement from './BlogManagement';
import ServiceManagement from './ServiceManagement';
import BookingManagement from './BookingManagement';
import CustomerManagement from './CustomerManagement';
import CategoryManagement from './CategoryManagement';
import HeroImageManagement from './HeroImageManagement';
import AboutSectionManagement from './AboutSectionManagement';
import SocialLinksManagement from './SocialLinksManagement';
import EmailSettingsManagement from './EmailSettingsManagement';
import ContentManagement from './ContentManagement';
import ContactInformationManagement from './ContactInformationManagement';
import ActivityLogManagement from './ActivityLogManagement';
import AdminManagement from './AdminManagement';
import ChangePassword from '../ChangePassword';

interface DashboardStats {
  totalBookings: number;
  totalTours: number;
  totalUsers: number;
  totalRevenue: number;
  recentBookings: any[];
}

interface DashboardOverviewProps {
  onQuickAction: (tab: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onQuickAction }) => {
  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'https://your-backend-domain.vercel.app/api';
  };

  const { data: statsData, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch(`${getApiUrl()}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    },
    refetchInterval: 30000,
  });

  const stats: DashboardStats = statsData?.data || {
    totalBookings: 0,
    totalTours: 0,
    totalUsers: 0,
    recentBookings: []
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 border dark:border-dark-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Icon icon={Icons.FiCalendar} className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : stats.totalBookings}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 border dark:border-dark-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Icon icon={Icons.FiMapPin} className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Tours</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : stats.totalTours}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 border dark:border-dark-700">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <Icon icon={Icons.FiUsers} className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? '...' : stats.totalUsers}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 border dark:border-dark-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onQuickAction('tours')}
            className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors duration-200"
          >
            <Icon icon={Icons.FiPlus} className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
            <span className="text-blue-900 dark:text-blue-300 font-medium">Create Tour</span>
          </button>

          <button
            onClick={() => onQuickAction('bookings')}
            className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors duration-200"
          >
            <Icon icon={Icons.FiCalendar} className="w-6 h-6 text-green-600 dark:text-green-400 mr-3" />
            <span className="text-green-900 dark:text-green-300 font-medium">View Bookings</span>
          </button>

          <button
            onClick={() => onQuickAction('customers')}
            className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
          >
            <Icon icon={Icons.FiUsers} className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3" />
            <span className="text-purple-900 dark:text-purple-300 font-medium">View Customers</span>
          </button>

          <button
            onClick={() => onQuickAction('content')}
            className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors duration-200"
          >
            <Icon icon={Icons.FiBarChart} className="w-6 h-6 text-orange-600 dark:text-orange-400 mr-3" />
            <span className="text-orange-900 dark:text-orange-300 font-medium">Manage Content</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg p-6 border dark:border-dark-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : stats.recentBookings?.length > 0 ? (
            stats.recentBookings.slice(0, 5).map((booking: any, index: number) => (
              <div key={index} className="flex items-center justify-between py-3 border-b dark:border-dark-600 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mr-3">
                    <Icon icon={Icons.FiCheck} className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">New booking confirmed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {booking.tour_title} - {booking.participants} participants
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(booking.created_at).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { state } = useAuth();

  // Check if user is super admin
  const isSuperAdmin = state.admin?.role === 'super_admin';

  // Debug logging
  console.log('🔍 Dashboard - Auth state:', {
    hasAdmin: !!state.admin,
    adminRole: state.admin?.role,
    adminEmail: state.admin?.email,
    isSuperAdmin: isSuperAdmin,
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Icons.FiHome },
    { id: 'tours', name: 'Tours', icon: Icons.FiMapPin },
    { id: 'services', name: 'Services', icon: Icons.FiTruck },
    { id: 'categories', name: 'Categories', icon: Icons.FiGrid },
    { id: 'bookings', name: 'Bookings', icon: Icons.FiCalendar },
    { id: 'customers', name: 'Customers', icon: Icons.FiUsers },
    { id: 'blogs', name: 'Blogs', icon: Icons.FiFileText },
    { id: 'content', name: 'Content', icon: Icons.FiEdit },
    { id: 'hero-images', name: 'Hero Images', icon: Icons.FiImage },
    { id: 'about-section', name: 'About Section', icon: Icons.FiInfo },
    { id: 'social-links', name: 'Social Links', icon: Icons.FiMessageCircle },
    { id: 'email-settings', name: 'Email Settings', icon: Icons.FiMail },
    { id: 'contact-information', name: 'Contact Information', icon: Icons.FiPhone },
    { id: 'activity-logs', name: 'Activity Logs', icon: Icons.FiActivity },
    // Only show Admin Management for super admins
    ...(isSuperAdmin ? [{ id: 'admin-management', name: 'Admin Management', icon: Icons.FiUserPlus }] : []),
    // Divider for account settings section
    { id: 'divider-1', name: 'divider', icon: null },
    // Account & Security section
    { id: 'change-password', name: 'Change Password', icon: Icons.FiLock },
    { id: 'account-settings', name: 'Account Settings', icon: Icons.FiSettings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'tours':
        return <TourManagement />;
      case 'services':
        return <ServiceManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'blogs':
        return <BlogManagement />;
      case 'content':
        return <ContentManagement />;
      case 'hero-images':
        return <HeroImageManagement />;
      case 'about-section':
        return <AboutSectionManagement />;
      case 'social-links':
        return <SocialLinksManagement />;
      case 'email-settings':
        return <EmailSettingsManagement />;
      case 'contact-information':
        return <ContactInformationManagement />;
      case 'activity-logs':
        return <ActivityLogManagement />;
      case 'admin-management':
        return <AdminManagement />;
      case 'change-password':
        return <ChangePassword />;
      case 'dashboard':
      default:
        return <DashboardOverview onQuickAction={setActiveTab} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      {/* Left Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-dark-800 shadow-lg border-r dark:border-dark-700 transition-all duration-300 flex-shrink-0`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-dark-700">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Icon
              icon={sidebarCollapsed ? Icons.FiChevronRight : Icons.FiChevronLeft}
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
            />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => {
              // Render divider with label
              if (tab.id.startsWith('divider-')) {
                return (
                  <div key={tab.id} className="py-2">
                    <div className="border-t dark:border-dark-700"></div>
                    {!sidebarCollapsed && (
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-3 mb-1 px-2">
                        Account & Security
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                  title={sidebarCollapsed ? tab.name : undefined}
                >
                  <Icon icon={tab.icon} className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'} flex-shrink-0`} />
                  {!sidebarCollapsed && (
                    <span className="truncate">{tab.name}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white dark:bg-dark-800 shadow-sm border-b dark:border-dark-700 px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Optional: Add user menu or other header actions here */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {state.admin?.name || state.admin?.email || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {state.admin?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <Icon icon={Icons.FiUser} className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
