import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';
import { Icon, Icons } from '../components/common/Icons';
import toast from 'react-hot-toast';

const Contact: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Here you would typically send the data to your backend
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      toast.success(t('Message sent successfully!') + ' ' + t('We\'ll get back to you soon.'));
      reset();
    } catch (error) {
      toast.error(t('Failed to send message. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
          <div className="bg-accent-orange text-white py-16">
              <div className="container mx-auto px-4">
                  <div className="text-center">
                      <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('Get in Touch')}</h1>
                      <p className="text-xl mb-8 opacity-90">
                          {t('We are always ready to help you plan the perfect trip. Contact us today!')}
                      </p>
                  </div>
              </div>
          </div>


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
                  123 Đường Du Lịch, Quận 1<br />
                  Thành phố Hồ Chí Minh, Việt Nam
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
                  +84 123 456 789<br />
                  +84 987 654 321
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
                  info@travelworld.vn<br />
                  booking@travelworld.vn
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
                  <p>{t('Monday - Friday')}: 8:00 - 18:00</p>
                  <p>{t('Saturday')}: 8:00 - 17:00</p>
                  <p>{t('Sunday')}: {t('Closed')}</p>
                </div>
              </div>
            </div>
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
