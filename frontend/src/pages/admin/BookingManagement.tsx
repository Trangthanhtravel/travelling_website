import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon, Icons } from '../../components/common/Icons';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  type: 'tour' | 'service';
  item_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  total_travelers: number;
  special_requests?: string;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'contacted' | 'completed' | 'cancelled';
  contacted_at?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

const BookingManagement: React.FC = () => {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [noteText, setNoteText] = useState('');
  const queryClient = useQueryClient();

  const getApiUrl = () => {
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  };

  // Fetch bookings
  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ['admin-bookings', searchTerm, filterStatus, filterService],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterService !== 'all') params.append('serviceType', filterService);

      const response = await fetch(`${getApiUrl()}/bookings?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
  });

  // Update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      const response = await fetch(`${getApiUrl()}/admin/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('Failed to update booking status');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      toast.success('Booking status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update booking status');
    }
  });

  // Add note to booking
  const addNoteMutation = useMutation({
    mutationFn: async ({ bookingId, message }: { bookingId: string; message: string }) => {
      const response = await fetch(`${getApiUrl()}/admin/bookings/${bookingId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });
      if (!response.ok) throw new Error('Failed to add note');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      setNoteText('');
      toast.success('Note added successfully');
    },
    onError: () => {
      toast.error('Failed to add note');
    }
  });

  const bookings: Booking[] = bookingsData?.data || [];

  const handleStatusUpdate = (bookingId: string, status: string) => {
    updateStatusMutation.mutate({ bookingId, status });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !noteText.trim()) return;
    addNoteMutation.mutate({ bookingId: selectedBooking.id, message: noteText.trim() });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'contacted':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300';
      case 'confirmed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'completed':
        return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300';
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <Icon icon={Icons.FiAlertCircle} className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Error loading bookings</h3>
        <p className="text-gray-600 dark:text-gray-400">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Booking Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage customer bookings and requests</p>
        </div>
        <div className="mt-4 sm:mt-0 text-sm text-gray-600 dark:text-gray-400">
          Total Bookings: {bookings.length}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg border dark:border-dark-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Bookings
            </label>
            <div className="relative">
              <Icon icon={Icons.FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by booking number, customer name, or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Service
            </label>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
            >
              <option value="all">All Services</option>
              <option value="tours">Tours</option>
              <option value="car-rental">Car Rental</option>
              <option value="other-services">Other Services</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white dark:bg-dark-800 rounded-lg shadow-lg border dark:border-dark-700">
        {isLoading ? (
          <div className="p-8 text-center">
            <Icon icon={Icons.FiLoader} className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <Icon icon={Icons.FiCalendar} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings found</h3>
            <p className="text-gray-600 dark:text-gray-400">Bookings will appear here when customers make requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-600">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Booking Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-600">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-dark-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          #{booking.id}
                        </div>
                        {booking.special_requests && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {booking.special_requests}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.customer_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {booking.customer_email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {booking.customer_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {booking.type === 'tour' ? 'Tour' : 'Service'}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                          {booking.item_id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      ${booking.total_amount || 0} {booking.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                        className={`text-xs font-medium px-2.5 py-0.5 rounded-full border-0 focus:ring-2 focus:ring-primary-500 ${getStatusColor(booking.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="contacted">Contacted</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        <Icon icon={Icons.FiEye} className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
              onClick={() => setSelectedBooking(null)}
            ></div>

            <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-dark-850 shadow-xl rounded-2xl">
              <div className="flex items-center justify-between p-6 border-b dark:border-dark-700">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Booking Details - #{selectedBooking.id}
                </h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <Icon icon={Icons.FiX} className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Customer Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.customer_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.customer_email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.customer_phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Service Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Service Information</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Service</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.type === 'tour' ? 'Tour' : 'Service'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                        <p className="text-gray-900 dark:text-white">{selectedBooking.item_id}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</label>
                        <p className="text-gray-900 dark:text-white">${selectedBooking.total_amount || 0} {selectedBooking.currency}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Form Details */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking Details</h4>
                  <div className="bg-gray-50 dark:bg-dark-700 p-4 rounded-lg overflow-x-auto">
                    <table className="min-w-full">
                      <tbody className="divide-y divide-gray-200 dark:divide-dark-600">
                        <tr>
                          <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Booking ID</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">{selectedBooking.id}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Type</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">{selectedBooking.type}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Item ID</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">{selectedBooking.item_id}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">
                            {selectedBooking.start_date ? new Date(selectedBooking.start_date).toLocaleDateString() : 'Not specified'}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Total Travelers</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">{selectedBooking.total_travelers}</td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">
                            ${selectedBooking.total_amount} {selectedBooking.currency}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</td>
                          <td className="py-2 text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                              {selectedBooking.status}
                            </span>
                          </td>
                        </tr>
                        {selectedBooking.special_requests && (
                          <tr>
                            <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Special Requests</td>
                            <td className="py-2 text-sm text-gray-900 dark:text-white">{selectedBooking.special_requests}</td>
                          </tr>
                        )}
                        {selectedBooking.contacted_at && (
                          <tr>
                            <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Contacted At</td>
                            <td className="py-2 text-sm text-gray-900 dark:text-white">
                              {new Date(selectedBooking.contacted_at).toLocaleString()}
                            </td>
                          </tr>
                        )}
                        {selectedBooking.confirmed_at && (
                          <tr>
                            <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Confirmed At</td>
                            <td className="py-2 text-sm text-gray-900 dark:text-white">
                              {new Date(selectedBooking.confirmed_at).toLocaleString()}
                            </td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Created At</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">
                            {new Date(selectedBooking.created_at).toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 pr-4 text-sm font-medium text-gray-500 dark:text-gray-400">Updated At</td>
                          <td className="py-2 text-sm text-gray-900 dark:text-white">
                            {new Date(selectedBooking.updated_at).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Admin Notes</h4>

                  {/* Add Note Form */}
                  <form onSubmit={handleAddNote} className="mb-4">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a note..."
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-dark-800 dark:text-white"
                      />
                      <button
                        type="submit"
                        disabled={!noteText.trim() || addNoteMutation.isPending}
                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Add Note
                      </button>
                    </div>
                  </form>

                  {/* Notes List */}
                  <div className="space-y-3 max-h-32 overflow-y-auto">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No notes available for this booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
