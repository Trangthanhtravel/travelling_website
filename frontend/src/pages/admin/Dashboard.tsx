import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
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
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Icons.FiHome },
    { id: 'tours', name: 'Tours', icon: Icons.FiMapPin },
    { id: 'services', name: 'Services', icon: Icons.FiTruck },
    { id: 'categories', name: 'Categories', icon: Icons.FiGrid },
    { id: 'bookings', name: 'Bookings', icon: Icons.FiCalendar },
    { id: 'customers', name: 'Customers', icon: Icons.FiUsers },
    { id: 'content', name: 'Blogs', icon: Icons.FiFileText },
    { id: 'hero-images', name: 'Hero Images', icon: Icons.FiImage },
    { id: 'about-section', name: 'About Section', icon: Icons.FiInfo },
    { id: 'social-links', name: 'Social Links', icon: Icons.FiMessageCircle },
    { id: 'email-settings', name: 'Email Settings', icon: Icons.FiMail },
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
      case 'content':
        return <BlogManagement />;
      case 'hero-images':
        return <HeroImageManagement />;
      case 'about-section':
        return <AboutSectionManagement />;
      case 'social-links':
        return <SocialLinksManagement />;
      case 'email-settings':
        return <EmailSettingsManagement />;
      case 'dashboard':
      default:
        return <DashboardOverview onQuickAction={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your travel business</p>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-dark-600">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-dark-500'
                  }`}
                >
                  <Icon icon={tab.icon} className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
