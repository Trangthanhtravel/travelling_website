import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { emailSettingsAPI } from '../../utils/api';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDarkMode } = useTheme();
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
      setLoading(true);
      const response = await emailSettingsAPI.getEmailSettings();
      setSettings(response.data.data);
    } catch (error: any) {
      console.error('Error fetching email settings:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
        localStorage.removeItem('adminToken');
        // Redirect will be handled by the API interceptor
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch email settings');
      }
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
      await emailSettingsAPI.updateEmailSettings(settings);
      toast.success('Email settings saved successfully');
    } catch (error: any) {
      console.error('Error saving email settings:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to save email settings');
      }
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
      await emailSettingsAPI.testEmailConfiguration({ testEmail });
      toast.success('Test email sent successfully');
    } catch (error: any) {
      console.error('Error testing email:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please log in again.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to send test email');
      }
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto p-6 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>Email Settings</h1>
        <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>Configure email notifications for bookings and customer communications</p>
      </div>

      {/* Email Configuration */}
      <div className={`rounded-lg shadow-md p-6 mb-6 ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>Email Configuration</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
              Company Email Address *
            </label>
            <input
              type="email"
              value={settings.company_email}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                isDarkMode 
                  ? 'bg-dark-700 border-dark-600 text-dark-text-primary placeholder-dark-text-muted' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter the receiver emmail"
              required
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
              This email will receive booking notifications from customers
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
              Company Name *
            </label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                isDarkMode 
                  ? 'bg-dark-700 border-dark-600 text-dark-text-primary placeholder-dark-text-muted' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter company name"
              required
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
              Email From Name
            </label>
            <input
              type="text"
              value={settings.email_from_name}
              onChange={(e) => handleInputChange('email_from_name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                isDarkMode 
                  ? 'bg-dark-700 border-dark-600 text-dark-text-primary placeholder-dark-text-muted' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter name of the sender"
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
              Name displayed in the "From" field of emails
            </p>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className={`rounded-lg shadow-md p-6 mb-6 ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>Notification Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="booking_notifications"
              checked={settings.booking_notification_enabled === 'true'}
              onChange={(e) => handleInputChange('booking_notification_enabled', e.target.checked ? 'true' : 'false')}
              className="h-4 w-4 text-accent-orange focus:ring-accent-orange border-gray-300 rounded"
            />
            <label htmlFor="booking_notifications" className={`ml-2 block text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
              Enable admin booking notifications
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="customer_confirmations"
              checked={settings.customer_confirmation_enabled === 'true'}
              onChange={(e) => handleInputChange('customer_confirmation_enabled', e.target.checked ? 'true' : 'false')}
              className="h-4 w-4 text-accent-orange focus:ring-accent-orange border-gray-300 rounded"
            />
            <label htmlFor="customer_confirmations" className={`ml-2 block text-sm ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
              Enable customer confirmation emails
            </label>
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className={`rounded-lg shadow-md p-6 mb-6 ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>Email Templates</h2>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
              Admin Notification Subject
            </label>
            <input
              type="text"
              value={settings.admin_notification_subject}
              onChange={(e) => handleInputChange('admin_notification_subject', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                isDarkMode 
                  ? 'bg-dark-700 border-dark-600 text-dark-text-primary placeholder-dark-text-muted' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="New Booking Received - {booking_number}"
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
              Available variables: {'{booking_number}'}, {'{customer_name}'}, {'{item_title}'}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
              Customer Confirmation Subject
            </label>
            <input
              type="text"
              value={settings.customer_confirmation_subject}
              onChange={(e) => handleInputChange('customer_confirmation_subject', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                isDarkMode 
                  ? 'bg-dark-700 border-dark-600 text-dark-text-primary placeholder-dark-text-muted' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Booking Confirmation - {booking_number}"
            />
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
              Available variables: {'{booking_number}'}, {'{customer_name}'}, {'{item_title}'}
            </p>
          </div>
        </div>
      </div>

      {/* Test Email */}
      <div className={`rounded-lg shadow-md p-6 mb-6 ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
        <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>Test Email Configuration</h2>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-accent-orange ${
                isDarkMode 
                  ? 'bg-dark-700 border-dark-600 text-dark-text-primary placeholder-dark-text-muted' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="test@example.com"
            />
          </div>
          <button
            onClick={handleTestEmail}
            disabled={testing || !testEmail}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testing ? 'Sending...' : 'Send Test Email'}
          </button>
        </div>
        <p className={`text-xs mt-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
          Send a test email to verify your email configuration is working correctly
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-6 py-2 bg-accent-orange text-white rounded-md hover:bg-accent-orange-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Help Section */}
      <div className={`border rounded-lg p-4 mt-6 ${
        isDarkMode 
          ? 'bg-yellow-900/20 border-yellow-700/50' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'}`}>Environment Variables Required:</h3>
        <ul className={`text-sm space-y-1 ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
          <li>• <code className={`px-1 py-0.5 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-yellow-100'}`}>EMAIL_HOST</code> - SMTP server host (e.g., smtp.gmail.com)</li>
          <li>• <code className={`px-1 py-0.5 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-yellow-100'}`}>EMAIL_PORT</code> - SMTP server port (usually 587)</li>
          <li>• <code className={`px-1 py-0.5 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-yellow-100'}`}>EMAIL_USER</code> - SMTP username/email</li>
          <li>• <code className={`px-1 py-0.5 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-yellow-100'}`}>EMAIL_PASS</code> - SMTP password/app password</li>
        </ul>
        <p className={`text-xs mt-2 ${isDarkMode ? 'text-yellow-400/80' : 'text-yellow-600'}`}>
          Make sure these environment variables are set in your deployment configuration (Vercel).
        </p>
      </div>

      {/* Gmail Setup Instructions */}
      <div className={`border rounded-lg p-4 mt-4 ${
        isDarkMode 
          ? 'bg-blue-900/20 border-blue-700/50' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-800'}`}>📧 How to Get Email Credentials (Gmail Example):</h3>
        <ol className={`text-sm space-y-2 ${isDarkMode ? 'text-blue-300' : 'text-blue-700'} list-decimal list-inside`}>
          <li>
            <strong>Enable 2-Step Verification</strong>
            <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
              <li>Go to your Google Account: <a href="https://myaccount.google.com" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">myaccount.google.com</a></li>
              <li>Navigate to Security → 2-Step Verification</li>
              <li>Follow the steps to enable it</li>
            </ul>
          </li>
          <li>
            <strong>Generate App Password</strong>
            <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
              <li>Go to: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">myaccount.google.com/apppasswords</a></li>
              <li>Select app: "Mail" and device: "Other (Custom name)"</li>
              <li>Name it: "Travel Website" or "Booking System"</li>
              <li>Click "Generate" - Copy the 16-character password</li>
            </ul>
          </li>
          <li>
            <strong>Set in Vercel</strong>
            <ul className="ml-6 mt-1 space-y-1 list-disc list-inside">
              <li>Go to your Vercel project → Settings → Environment Variables</li>
              <li>Add: <code className={`px-1 py-0.5 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-blue-100'}`}>EMAIL_HOST</code> = smtp.gmail.com</li>
              <li>Add: <code className={`px-1 py-0.5 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-blue-100'}`}>EMAIL_PORT</code> = 587</li>
              <li>Add: <code className={`px-1 py-0.5 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-blue-100'}`}>EMAIL_USER</code> = your-email@gmail.com</li>
              <li>Add: <code className={`px-1 py-0.5 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-blue-100'}`}>EMAIL_PASS</code> = (16-char app password)</li>
              <li>Redeploy your backend after adding variables</li>
            </ul>
          </li>
        </ol>
        <div className={`mt-3 p-2 rounded ${isDarkMode ? 'bg-blue-950/50' : 'bg-blue-100'}`}>
          <p className={`text-xs ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
            💡 <strong>Other Email Providers:</strong> Outlook (smtp.office365.com:587), Yahoo (smtp.mail.yahoo.com:587),
            SendGrid, Mailgun, or any SMTP service - just use their SMTP settings instead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsManagement;
