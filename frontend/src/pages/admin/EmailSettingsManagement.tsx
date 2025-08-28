import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface EmailSettings {
  company_email: string;
  company_name: string;
  email_from_name: string;
  booking_notification_enabled: string;
  customer_confirmation_enabled: string;
  admin_notification_subject: string;
  customer_confirmation_subject: string;
}

const EmailSettingsManagement: React.FC = () => {
  const [settings, setSettings] = useState<EmailSettings>({
    company_email: '',
    company_name: '',
    email_from_name: '',
    booking_notification_enabled: 'true',
    customer_confirmation_enabled: 'true',
    admin_notification_subject: 'New Booking Received - {booking_number}',
    customer_confirmation_subject: 'Booking Confirmation - {booking_number}'
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    fetchEmailSettings();
  }, []);

  const fetchEmailSettings = async () => {
    try {
      const token = localStorage.getItem('adminToken');

      // Check if token exists and is valid
      if (!token || token === 'null' || token === 'undefined') {
        toast.error('Please log in to access email settings');
        // Redirect to login or handle authentication
        return;
      }

      const response = await fetch('/api/email-settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          localStorage.removeItem('adminToken');
          // Redirect to login page
        } else {
          toast.error(errorData.message || 'Failed to fetch email settings');
        }
      }
    } catch (error) {
      console.error('Error fetching email settings:', error);
      toast.error('Error fetching email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: keyof EmailSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');

      if (!token || token === 'null' || token === 'undefined') {
        toast.error('Please log in to save settings');
        return;
      }

      const response = await fetch('/api/email-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings })
      });

      if (response.ok) {
        toast.success('Email settings updated successfully');
      } else {
        const data = await response.json();
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          localStorage.removeItem('adminToken');
        } else {
          toast.error(data.message || 'Failed to update settings');
        }
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    setTesting(true);
    try {
      const token = localStorage.getItem('adminToken');

      if (!token || token === 'null' || token === 'undefined') {
        toast.error('Please log in to test email');
        return;
      }

      const response = await fetch('/api/email-settings/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ testEmail })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setTestEmail('');
      } else {
        if (response.status === 401) {
          toast.error('Authentication failed. Please log in again.');
          localStorage.removeItem('adminToken');
        } else {
          toast.error(data.message || 'Failed to send test email');
        }
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Error sending test email');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Email Settings</h1>
        <p className="text-gray-600">Configure email notifications for bookings and customer communications</p>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Email Address *
            </label>
            <input
              type="email"
              value={settings.company_email}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="info@company.com"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This email will receive booking notifications from customers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Travel Company"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email From Name
            </label>
            <input
              type="text"
              value={settings.email_from_name}
              onChange={(e) => handleInputChange('email_from_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Travel Company Team"
            />
            <p className="text-xs text-gray-500 mt-1">
              Name displayed in the "From" field of emails
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="booking_notifications"
              checked={settings.booking_notification_enabled === 'true'}
              onChange={(e) => handleInputChange('booking_notification_enabled', e.target.checked ? 'true' : 'false')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="booking_notifications" className="ml-2 block text-sm text-gray-900">
              Enable admin booking notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="customer_confirmations"
              checked={settings.customer_confirmation_enabled === 'true'}
              onChange={(e) => handleInputChange('customer_confirmation_enabled', e.target.checked ? 'true' : 'false')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="customer_confirmations" className="ml-2 block text-sm text-gray-900">
              Enable customer confirmation emails
            </label>
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Templates</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notification Subject
            </label>
            <input
              type="text"
              value={settings.admin_notification_subject}
              onChange={(e) => handleInputChange('admin_notification_subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="New Booking Received - {booking_number}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {'{booking_number}'}, {'{customer_name}'}, {'{item_title}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Confirmation Subject
            </label>
            <input
              type="text"
              value={settings.customer_confirmation_subject}
              onChange={(e) => handleInputChange('customer_confirmation_subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Booking Confirmation - {booking_number}"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {'{booking_number}'}, {'{customer_name}'}, {'{item_title}'}
            </p>
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Email Configuration</h2>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test@example.com"
            />
          </div>
          <button
            onClick={handleTestEmail}
            disabled={testing || !testEmail}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Send a test email to verify your email configuration is working correctly
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Help Section */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Environment Variables Required:</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <code>EMAIL_HOST</code> - SMTP server host (e.g., smtp.gmail.com)</li>
          <li>• <code>EMAIL_PORT</code> - SMTP server port (usually 587)</li>
          <li>• <code>EMAIL_USER</code> - SMTP username/email</li>
          <li>• <code>EMAIL_PASS</code> - SMTP password/app password</li>
        </ul>
        <p className="text-xs text-yellow-600 mt-2">
          Make sure these environment variables are set in your deployment configuration.
        </p>
      </div>
    </div>
  );
};

export default EmailSettingsManagement;
