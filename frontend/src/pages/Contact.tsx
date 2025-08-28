import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTheme } from '../contexts/ThemeContext';
import { Icon, Icons } from '../components/common/Icons';
import toast from 'react-hot-toast';

const schema = yup.object({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  subject: yup.string().required('Subject is required'),
  message: yup.string().min(10, 'Message must be at least 10 characters').required('Message is required'),
});

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

      toast.success('Message sent successfully! We\'ll get back to you soon.');
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
      {/* Hero Section */}
      <div className="bg-accent-orange text-white py-16 mb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Have questions about our tours or need help planning your next adventure? We're here to help!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                Contact Information
              </h2>
              <p className={`text-lg mb-8 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                Reach out to us through any of these channels. We're available 24/7 to assist you.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  icon: Icons.FiMapPin,
                  title: 'Address',
                  content: '123 Travel Street, Ho Chi Minh City, Vietnam',
                },
                {
                  icon: Icons.FiPhone,
                  title: 'Phone',
                  content: '+84-123-456-789',
                },
                {
                  icon: Icons.FiMail,
                  title: 'Email',
                  content: 'info@travelworld.com',
                },
                {
                  icon: Icons.FiClock,
                  title: 'Business Hours',
                  content: 'Mon - Fri: 9:00 AM - 6:00 PM',
                },
              ].map((item, index) => (
                <div key={index} className={`flex items-start space-x-4 p-6 rounded-lg ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-light-50 border border-light-300'}`}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent-orange rounded-lg flex items-center justify-center">
                      <Icon icon={item.icon} className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold mb-1 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                      {item.title}
                    </h3>
                    <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                      {item.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Media */}
            <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-light-50 border border-light-300'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                Follow Us
              </h3>
              <div className="flex space-x-4">
                {[
                  { icon: Icons.FiFacebook, label: 'Facebook' },
                  { icon: Icons.FiInstagram, label: 'Instagram' },
                  { icon: Icons.FiTwitter, label: 'Twitter' },
                ].map((social, index) => (
                  <button
                    key={index}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      isDarkMode 
                        ? 'bg-dark-700 text-dark-text-muted hover:bg-accent-orange hover:text-white' 
                        : 'bg-light-200 text-light-text-muted hover:bg-accent-orange hover:text-white'
                    }`}
                    aria-label={social.label}
                  >
                    <Icon icon={social.icon} className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className={`p-8 rounded-lg shadow-lg ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-light-50 border border-light-300'}`}>
            <h2 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-secondary'}`}>
                  Name *
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className="input-field"
                  placeholder="Your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-secondary'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className="input-field"
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-secondary'}`}>
                  Subject *
                </label>
                <input
                  type="text"
                  {...register('subject')}
                  className="input-field"
                  placeholder="What is this about?"
                />
                {errors.subject && (
                  <p className="mt-1 text-sm text-error">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-light-text-secondary'}`}>
                  Message *
                </label>
                <textarea
                  {...register('message')}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-error">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Icon icon={Icons.FiSend} className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <h2 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
            Find Us
          </h2>
          <div className={`rounded-lg overflow-hidden shadow-lg border ${isDarkMode ? 'border-dark-700' : 'border-light-300'}`}>
            {/* Replace with actual map implementation */}
            <div className={`h-96 flex items-center justify-center ${isDarkMode ? 'bg-dark-800' : 'bg-light-200'}`}>
              <div className="text-center">
                <Icon icon={Icons.FiMapPin} className={`w-12 h-12 mx-auto mb-4 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`} />
                <p className={`${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  Interactive map will be displayed here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
