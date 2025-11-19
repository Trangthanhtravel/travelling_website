import React, { useState, useEffect } from 'react';
import { activityLogsAPI } from '../../utils/api';

interface ActivityLog {
  id: number;
  admin_id: number;
  admin_name: string;
  admin_email: string;
  action_type: 'create' | 'update' | 'delete';
  resource_type: 'tour' | 'category' | 'service' | 'blog' | 'booking' | 'admin' | 'content' | 'settings';
  resource_id: number | null;
  resource_name: string | null;
  changes: any;
  ip_address: string | null;
  created_at: string;
}

interface ActivityStats {
  actionStats: { action_type: string; resource_type: string; count: number }[];
  adminStats: { admin_id: number; admin_name: string; admin_email: string; action_count: number }[];
  dailyStats: { date: string; count: number }[];
}

const ActivityLogManagement: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [showStats, setShowStats] = useState(false);

  // Filters
  const [filterActionType, setFilterActionType] = useState("");
  const [filterResourceType, setFilterResourceType] = useState("");
  const [filterAdminId, setFilterAdminId] = useState("");

  const fetchActivityLogs = async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50"
      });

      if (filterActionType) params.append('action_type', filterActionType);
      if (filterResourceType) params.append('resource_type', filterResourceType);
      if (filterAdminId) params.append('admin_id', filterAdminId);

      const response = await activityLogsAPI.getActivityLogs(params);
      const result = response.data as any; // Backend returns pagination at root level

      if (result.success) {
        setLogs(result.data);
        if (result.pagination) {
          setCurrentPage(result.pagination.page);
          setTotalPages(result.pagination.totalPages);
          setTotal(result.pagination.total);
        }
      } else {
        setError(result.message || "Failed to fetch activity logs");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch activity logs");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const response = await activityLogsAPI.getActivityStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
    fetchActivityStats();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getActionBadgeClass = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getResourceIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'tour': return '🗺️';
      case 'category': return '📁';
      case 'service': return '⚙️';
      case 'blog': return '📝';
      case 'booking': return '📅';
      case 'admin': return '👤';
      case 'content': return '📄';
      case 'settings': return '⚙️';
      default: return '📦';
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchActivityLogs(1);
  };

  const resetFilters = () => {
    setFilterActionType("");
    setFilterResourceType("");
    setFilterAdminId("");
    setCurrentPage(1);
    fetchActivityLogs(1);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track admin actions - {total} total activities
          </p>
        </div>
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showStats ? 'Hide Stats' : 'Show Stats'}
        </button>
      </div>

      {/* Statistics */}
      {showStats && stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Most Active Admins */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Most Active (30 days)
            </h3>
            <div className="space-y-2">
              {stats.adminStats.slice(0, 5).map((admin) => (
                <div key={admin.admin_id} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{admin.admin_name}</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {admin.action_count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Types */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Actions by Type
            </h3>
            <div className="space-y-2">
              {stats.actionStats.slice(0, 5).map((stat, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {stat.action_type} {stat.resource_type}
                  </span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {stat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Daily Activity
            </h3>
            <div className="space-y-2">
              {stats.dailyStats.slice(0, 5).map((day) => (
                <div key={day.date} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(day.date).toLocaleDateString()}
                  </span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {day.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Action Type
            </label>
            <select
              value={filterActionType}
              onChange={(e) => setFilterActionType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resource Type
            </label>
            <select
              value={filterResourceType}
              onChange={(e) => setFilterResourceType(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">All Resources</option>
              <option value="tour">Tours</option>
              <option value="category">Categories</option>
              <option value="service">Services</option>
              <option value="blog">Blogs</option>
              <option value="booking">Bookings</option>
              <option value="admin">Admins</option>
              <option value="content">Content</option>
              <option value="settings">Settings</option>
            </select>
          </div>

          <div className="flex items-end space-x-2 col-span-2">
            <button
              onClick={applyFilters}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Activity Logs Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Loading activity logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No activity logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.admin_name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {log.admin_email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeClass(log.action_type)}`}>
                        {log.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="mr-2">{getResourceIcon(log.resource_type)}</span>
                      <span className="text-gray-900 dark:text-white capitalize">
                        {log.resource_type}
                      </span>
                      {log.resource_id && (
                        <span className="text-gray-500 dark:text-gray-400"> #{log.resource_id}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {log.resource_name || <span className="italic">No name</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => fetchActivityLogs(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => fetchActivityLogs(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => fetchActivityLogs(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchActivityLogs(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogManagement;


