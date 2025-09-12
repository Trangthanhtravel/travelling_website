import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import ContactManagement from '../../components/admin/ContactManagement';

const ContactInformationManagement: React.FC = () => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
            Contact Information Management
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
            Manage your business contact information that will be displayed on the contact page and footer.
          </p>
        </div>

        <ContactManagement />
      </div>
    </div>
  );
};

export default ContactInformationManagement;
