import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon, Icons } from '../components/common/Icons';
import { servicesAPI } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';

const ServiceDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { isDarkMode } = useTheme();
  const { t, language, getLocalizedContent } = useTranslation();

  const { data: serviceData, isLoading, error } = useQuery({
    queryKey: ['service', slug, language],
    queryFn: () => servicesAPI.getServiceBySlug(slug!, language),
    enabled: !!slug,
  });

  const service = serviceData?.data;

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
        <div className="animate-pulse">
          <div className={`h-96 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className={`h-8 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded`}></div>
                <div className={`h-4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded w-3/4`}></div>
                <div className="space-y-2">
                  <div className={`h-4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded`}></div>
                  <div className={`h-4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded`}></div>
                  <div className={`h-4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded w-2/3`}></div>
                </div>
              </div>
              <div className={`h-96 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'} rounded-lg`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('Service Not Found')}
          </h1>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {t('The service you\'re looking for doesn\'t exist or has been removed.')}
          </p>
          <Link to="/services" className="btn-primary">
            {t('Browse All Services')}
          </Link>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string | any) => {
    const categoryStr = typeof category === 'string' ? category : category?.slug || category?.name || 'default';
    switch (categoryStr) {
      case 'tours': return Icons.FiMapPin;
      case 'car-rental': return Icons.FiTruck;
      case 'hotel-booking': return Icons.FiHome;
      case 'cruise': return Icons.FiAnchor;
      case 'train-booking': return Icons.FiNavigation;
      case 'visa-service': return Icons.FiFileText;
      default: return Icons.FiSettings;
    }
  };

  const getCategoryName = (category: string | any) => {
    if (!category) return t('General Service');
    if (typeof category === 'string') return category.replace('-', ' ');
    return getLocalizedContent(category, 'name') || category.name || category.slug?.replace('-', ' ') || t('General Service');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Hero Image Gallery */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={service.image || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`}
          alt={getLocalizedContent(service, 'title') || service.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Service Header */}
            <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
              <div className={`flex items-center text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <Icon icon={getCategoryIcon(service.category)} className="w-4 h-4 mr-1" />
                <span className="capitalize">{getCategoryName(service.category)}</span>
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {getLocalizedContent(service, 'title') || service.title}
              </h1>
              {service.subtitle && (
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                  {getLocalizedContent(service, 'subtitle') || service.subtitle}
                </p>
              )}
              <div className="flex items-center space-x-4">
                {service.price && (
                  <div className="flex items-center">
                    <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${service.price}
                    </span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      {t('per service')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Service Description */}
            <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('Service Details')}
              </h2>
              <div className={`prose max-w-none ${isDarkMode ? 'prose-invert' : ''}`}>
                {service.description ? (
                  <div dangerouslySetInnerHTML={{
                    __html: getLocalizedContent(service, 'description') || service.description
                  }} />
                ) : (
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {getLocalizedContent(service, 'description') || t('No description available for this service.')}
                  </p>
                )}
              </div>
            </div>

            {/* Photo Gallery */}
            {service.gallery && service.gallery.length > 0 && (
              <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Photo Gallery</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {service.gallery.map((photo: string, index: number) => {
                    // Skip rendering if photo URL is malformed or empty
                    if (!photo || photo.includes('undefined') || photo.startsWith('https://https://')) {
                      return null;
                    }

                    return (
                      <div key={`gallery-${index}`} className="relative group cursor-pointer">
                        <img
                          src={photo}
                          alt={`${service.title} Gallery ${index + 1}`}
                          className="w-full h-32 md:h-40 object-cover rounded-lg border border-gray-200 dark:border-dark-600 transition-transform duration-200 group-hover:scale-105"
                          onClick={() => {
                            // Open image in a new tab for full view
                            window.open(photo, '_blank');
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Hide broken images
                            target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                          <Icon icon={Icons.FiEye} className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-lg p-6 sticky top-8 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('Book This Service')}
                </h3>
                {service.price && (
                  <div className="flex items-baseline">
                    <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${service.price}
                    </span>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-2`}>
                      {t('per service')}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {t('Service Type')}
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getCategoryName(service.category)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {t('Availability')}
                  </span>
                  <span className="text-green-600 font-medium">
                    {t('Available')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {t('Response Time')}
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {t('Within 2 hours')}
                  </span>
                </div>
              </div>

              <Link
                to={`/service-booking/${service.slug}`}
                className="w-full bg-accent-orange hover:bg-accent-orange-dark text-white py-3 rounded-lg font-medium transition-colors duration-200 block text-center"
              >
                {t('Book Now')}
              </Link>

              <div className="mt-4 text-center">
                <button className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} flex items-center justify-center w-full`}>
                  <Icon icon={Icons.FiMessageCircle} className="w-4 h-4 mr-1" />
                  {t('Contact for Custom Quote')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
