import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from "../contexts/TranslationContext";

const BookingPolicy: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  // Fetch booking policy content
  const { data: policyData, isLoading } = useQuery({
    queryKey: ['booking-policy'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/content/booking_policy_content`);
      if (!response.ok) throw new Error('Failed to fetch booking policy');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: titleData } = useQuery({
    queryKey: ['booking-policy-title'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/content/booking_policy_title`);
      if (!response.ok) throw new Error('Failed to fetch booking policy title');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const policyContent = policyData?.data?.content || '';
  const policyTitle = titleData?.data?.content || t('Booking Terms & Conditions');

  if (isLoading) {
    return (
      <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="bg-accent-orange text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-12 bg-white/20 rounded mb-4 max-w-md mx-auto"></div>
                <div className="h-6 bg-white/20 rounded max-w-2xl mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="bg-accent-orange text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{policyTitle}</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
                {t('Please read our booking terms and conditions carefully before making a reservation.')}
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <section className={`py-20 transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-white'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`prose prose-lg max-w-none ${
            isDarkMode 
              ? 'prose-invert prose-headings:text-dark-text-secondary prose-p:text-dark-text-primary prose-strong:text-dark-text-secondary prose-li:text-dark-text-primary' 
              : 'prose-gray'
          }`}>
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h1 className={`text-3xl font-bold mb-6 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className={`text-2xl font-bold mb-4 mt-8 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className={`text-xl font-semibold mb-3 mt-6 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-800'}`}>
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className={`mb-4 leading-relaxed ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                    {children}
                  </p>
                ),
                ul: ({ children }) => (
                  <ul className={`mb-4 pl-6 space-y-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className={`mb-4 pl-6 space-y-2 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="list-disc">
                    {children}
                  </li>
                ),
                strong: ({ children }) => (
                  <strong className={isDarkMode ? 'text-dark-text-secondary font-semibold' : 'text-gray-900 font-semibold'}>
                    {children}
                  </strong>
                ),
              }}
            >
              {policyContent}
            </ReactMarkdown>
          </div>

          {/* Contact Section */}
          <div className={`mt-12 p-6 rounded-lg border ${
            isDarkMode ? 'bg-dark-800 border-dark-700' : 'bg-gray-100 border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
              Questions about our policy?
            </h3>
            <p className={`mb-4 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
              If you have any questions about our booking policy or need clarification on any terms, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:info.trangthanhtravel@gmail.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Email Us
              </a>
              <a
                href="tel:+842838388007"
                className={`inline-flex items-center justify-center px-6 py-3 rounded-lg border transition-colors duration-200 ${
                  isDarkMode
                    ? 'border-dark-600 text-dark-text-secondary hover:bg-dark-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingPolicy;
