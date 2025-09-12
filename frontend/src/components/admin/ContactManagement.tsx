import React, { useState, useEffect } from 'react';
import { useForm, FieldError } from 'react-hook-form';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon, Icons } from '../common/Icons';
import { ContactInfo, ContactFormData } from '../../types/contact';
import toast from 'react-hot-toast';

interface ContactManagementProps {
  onClose?: () => void;
}

const ContactManagement: React.FC<ContactManagementProps> = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ContactFormData>({
    defaultValues: {
      email: '',
      phone: '',
      address: '',
      business_hours: {
        monday: '8:00 - 18:00',
        tuesday: '8:00 - 18:00',
        wednesday: '8:00 - 18:00',
        thursday: '8:00 - 18:00',
        friday: '8:00 - 18:00',
        saturday: '8:00 - 17:00',
        sunday: 'Closed'
      },
      google_map_link: ''
    }
  });

  // Fetch existing contact info
  const fetchContactInfo = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/contact');
      if (!response.ok) throw new Error('Failed to fetch contact info');

      const data = await response.json();
      setContactInfo(data);

      // Populate form with existing data
      setValue('email', data.email || '');
      setValue('phone', data.phone || '');
      setValue('address', data.address || '');
      setValue('google_map_link', data.google_map_link || '');

      if (data.business_hours) {
        const days: (keyof ContactFormData['business_hours'])[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
          setValue(`business_hours.${day}`, data.business_hours[day] || '');
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      toast.error('Failed to load contact information');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const onSubmit = async (data: ContactFormData) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          email: data.email,
          phone: data.phone,
          address: data.address,
          businessHours: data.business_hours,
          googleMapLink: data.google_map_link || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contact info');
      }

      const result = await response.json();
      setContactInfo(result.contactInfo);
      toast.success('Contact information updated successfully!');

      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating contact info:', error);
      toast.error(error.message || 'Failed to update contact information');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-orange"></div>
          <span className={`ml-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
            Loading contact information...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-lg`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-900'}`}>
          Contact Information Management
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'hover:bg-dark-700 text-dark-text-muted hover:text-dark-text-primary' 
                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon icon={Icons.FiX} className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
            Email Address
          </label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email format'
              }
            })}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-dark-700 border-dark-600 text-dark-text-primary focus:border-accent-orange' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-accent-orange'
            } focus:outline-none focus:ring-2 focus:ring-accent-orange/20`}
            placeholder="Enter email address"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
            Phone Number
          </label>
          <input
            type="text"
            {...register('phone', {
              required: 'Phone number is required'
            })}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-dark-700 border-dark-600 text-dark-text-primary focus:border-accent-orange' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-accent-orange'
            } focus:outline-none focus:ring-2 focus:ring-accent-orange/20`}
            placeholder="Enter phone number"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
            Address
          </label>
          <textarea
            {...register('address', {
              required: 'Address is required'
            })}
            rows={3}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-dark-700 border-dark-600 text-dark-text-primary focus:border-accent-orange' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-accent-orange'
            } focus:outline-none focus:ring-2 focus:ring-accent-orange/20 resize-none`}
            placeholder="Enter business address"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>
          )}
        </div>

        {/* Google Map Link */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
            Google Map Embed Link
          </label>
          <input
            type="url"
            {...register('google_map_link', {
              pattern: {
                value: /^https?:\/\/.+/,
                message: 'Please enter a valid URL'
              }
            })}
            className={`w-full px-4 py-3 rounded-lg border ${
              isDarkMode 
                ? 'bg-dark-700 border-dark-600 text-dark-text-primary focus:border-accent-orange' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-accent-orange'
            } focus:outline-none focus:ring-2 focus:ring-accent-orange/20`}
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          {errors.google_map_link && (
            <p className="mt-1 text-sm text-red-500">{errors.google_map_link.message}</p>
          )}
          <p className={`mt-1 text-xs ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}`}>
            Get embed link from Google Maps by clicking "Share" → "Embed a map"
          </p>
        </div>

        {/* Business Hours */}
        <div>
          <label className={`block text-sm font-medium mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-700'}`}>
            Business Hours
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const).map((day) => (
              <div key={day}>
                <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </label>
                <input
                  type="text"
                  {...register(`business_hours.${day}`, {
                    required: `${day.charAt(0).toUpperCase() + day.slice(1)} hours are required`
                  })}
                  className={`w-full px-3 py-2 rounded-lg border text-sm ${
                    isDarkMode 
                      ? 'bg-dark-700 border-dark-600 text-dark-text-primary focus:border-accent-orange' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-accent-orange'
                  } focus:outline-none focus:ring-1 focus:ring-accent-orange/20`}
                  placeholder="8:00 - 18:00 or Closed"
                />
                {errors.business_hours?.[day] && (
                  <p className="mt-1 text-xs text-red-500">
                    {(errors.business_hours[day] as FieldError)?.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 bg-accent-orange hover:bg-accent-orange-hover text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Icon icon={Icons.FiSave} className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactManagement;
