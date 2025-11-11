import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';
import { Icon, Icons } from '../components/common/Icons';
import { useContactInfo } from '../hooks/useContactInfo';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t, language } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { contactInfo, isLoading, error } = useContactInfo();

  const schema = yup.object({
    name: yup.string().required(t('Name is required')),
    email: yup.string().email(t('Invalid email')).required(t('Email is required')),
    subject: yup.string().required(t('Subject is required')),
    message: yup.string().min(10, t('Message must be at least 10 characters')).required(t('Message is required')),
  });

    interface ContactFormData {
        name: string;
        email: string;
        subject: string;
        message: string;
    }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/contact/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          language: language
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      toast.success(result.message || t('Message sent successfully!') + ' ' + t('We\'ll get back to you soon.'));
      reset();
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      toast.error(error.message || t('Failed to send message. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
        <div className="bg-accent-orange text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('Contact Us')}</h1>
              <p className="text-xl mb-8 opacity-90">
                {t('Have a question or ready to book your next adventure? Contact us now to start planning your perfect trip. Our team of travel experts is here to help with any inquiries you may have')}
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-orange"></div>
            <span className={`ml-3 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
              Loading contact information...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
        <div className="bg-accent-orange text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('Contact Us')}</h1>
              <p className="text-xl mb-8 opacity-90">
                {t('Have a question or ready to book your next adventure? Contact us now to start planning your perfect trip. Our team of travel experts is here to help with any inquiries you may have')}
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-lg text-center`}>
            <Icon icon={Icons.FiAlertCircle} className="w-8 h-8 mx-auto mb-4 text-red-500" />
            <p className={`${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
        {/* Header */}
        <div className="bg-accent-orange text-white py-16">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('Contact Us')}</h1>
                    <p className="text-xl mb-8 opacity-90">
                        {t('Have a question or ready to book your next adventure? Contact us now to start planning your perfect trip. Our team of travel experts is here to help with any inquiries you may have')}
                    </p>
                </div>
            </div>
        </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
              {t('Contact Information')}
            </h2>

            <div className="space-y-6">
              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center mb-4">
                  <Icon icon={Icons.FiMapPin} className={`w-6 h-6 mr-3 ${isDarkMode ? 'text-accent-orange' : 'text-accent-orange'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {t('Office Address')}
                  </h3>
                </div>
                <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  {contactInfo?.address || '123 Đường Du Lịch, Quận 1, Thành phố Hồ Chí Minh, Việt Nam'}
                </p>
              </div>

              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center mb-4">
                  <Icon icon={Icons.FiPhone} className={`w-6 h-6 mr-3 ${isDarkMode ? 'text-accent-orange' : 'text-accent-orange'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {t('Phone Number')}
                  </h3>
                </div>
                <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  {contactInfo?.phone || '+84 123 456 789'}
                </p>
              </div>

              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center mb-4">
                  <Icon icon={Icons.FiMail} className={`w-6 h-6 mr-3 ${isDarkMode ? 'text-accent-orange' : 'text-accent-orange'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {t('Email Address')}
                  </h3>
                </div>
                <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  {contactInfo?.email || 'info@travelworld.vn'}
                </p>
              </div>

              <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center mb-4">
                  <Icon icon={Icons.FiClock} className={`w-6 h-6 mr-3 ${isDarkMode ? 'text-accent-orange' : 'text-accent-orange'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {t('Business Hours')}
                  </h3>
                </div>
                <div className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  {contactInfo?.business_hours ? (
                    Object.entries(contactInfo.business_hours).map(([day, hours]) => (
                      <p key={day}>
                        {t(day.charAt(0).toUpperCase() + day.slice(1))}: {hours}
                      </p>
                    ))
                  ) : (
                    <>
                      <p>{t('Monday - Friday')}: 8:00 - 18:00</p>
                      <p>{t('Saturday')}: 8:00 - 17:00</p>
                      <p>{t('Sunday')}: {t('Closed')}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Google Map */}
            {contactInfo?.google_map_link && (
              <div className={`mt-8 p-6 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-lg`}>
                <div className="flex items-center mb-4">
                  <Icon icon={Icons.FiMap} className={`w-6 h-6 mr-3 ${isDarkMode ? 'text-accent-orange' : 'text-accent-orange'}`} />
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {t('Find Us on Map')}
                  </h3>
                </div>
                <div className="w-full h-64 rounded-lg overflow-hidden">
                  <iframe
                    src={contactInfo.google_map_link}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office Location"
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div>
            <h2 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
              {t('Send us a Message')}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className={`p-8 rounded-lg ${isDarkMode ? 'bg-dark-800' : 'bg-white'} shadow-lg`}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {t('Full Name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-primary' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                    placeholder={t('Full Name')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {t('Email Address')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-primary' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                    placeholder={t('Email Address')}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {t('Subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    {...register('subject')}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-primary' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                    placeholder={t('Subject')}
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-500">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                    {t('Message')}
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    {...register('message')}
                    className={`w-full px-4 py-3 rounded-lg border ${isDarkMode ? 'bg-dark-700 border-dark-600 text-dark-text-primary' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent resize-none`}
                    placeholder={t('Your message')}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent-orange hover:bg-accent-orange-hover text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('Loading...') : t('Send Message')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
