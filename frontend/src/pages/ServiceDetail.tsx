import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Icon, Icons } from '../components/common/Icons';
import { servicesAPI } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';

const ServiceDetail: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { isDarkMode } = useTheme();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: serviceData, isLoading, error } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => servicesAPI.getServiceById(serviceId!),
    enabled: !!serviceId,
  });

  const service = serviceData?.data?.data; // Fixed: added .service

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
          <h1 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Service Not Found</h1>
          <p className={`mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>The service you're looking for doesn't exist or has been removed.</p>
          <Link to="/services" className="btn-primary">
            Browse All Services
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
    if (!category) return 'General Service';
    if (typeof category === 'string') return category.replace('-', ' ');
    return category.name || category.slug?.replace('-', ' ') || 'General Service';
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Hero Image Gallery */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        <img
          src={service.images?.[selectedImage] || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80`}
          alt={service.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>

        {/* Image Navigation */}
        {service.images && service.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {service.images.slice(0, 5).map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === selectedImage ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
            {service.images.length > 5 && (
              <button className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                <Icon icon={Icons.FiCamera} className="w-4 h-4 inline mr-1" />
                +{service.images.length - 5}
              </button>
            )}
          </div>
        )}
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
                {service.title}
              </h1>
              {service.subtitle && (
                <p className={`text-lg mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {service.subtitle}
                </p>
              )}

              <div className={`flex flex-wrap items-center gap-6 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {service.duration && (
                  <div className="flex items-center">
                    <Icon icon={Icons.FiClock} className="w-4 h-4 mr-1" />
                    {service.duration}
                  </div>
                )}
                <div className="flex items-center">
                  <Icon icon={Icons.FiTag} className="w-4 h-4 mr-1" />
                  <span className="capitalize">
                    {service.service_type ?
                      (typeof service.service_type === 'string' ? service.service_type.replace('-', ' ') :  'General Service') :
                      getCategoryName(service.category)}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>About This Service</h2>
              <div className={`prose max-w-none ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                <p>{service.description}</p>
              </div>
            </div>

            {/* Itinerary (if available) */}
            {service.itinerary && service.itinerary.length > 0 && (
              <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
                <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Itinerary</h2>
                <div className="space-y-4">
                  {service.itinerary.map((item: string, index: number) => (
                    <div key={index} className="border-l-4 border-primary-200 pl-6">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                          {index + 1}
                        </div>
                        <p className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center">
                    <Icon icon={Icons.FiCheck} className="w-5 h-5 mr-2" />
                    Included
                  </h3>
                  <ul className="space-y-2">
                    {service.included && service.included.map((inclusion: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Icon icon={Icons.FiCheck} className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {service.excluded && service.excluded.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center">
                      <Icon icon={Icons.FiX} className="w-5 h-5 mr-2" />
                      Not Included
                    </h3>
                    <ul className="space-y-2">
                      {service.excluded.map((exclusion: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Icon icon={Icons.FiX} className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{exclusion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600">
                    ${service.price}
                  </div>
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {service.category === 'tours' ? 'per person' :
                     service.category === 'car-rental' ? 'per day' : 'starting from'}
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  {service.duration && (
                    <div className="flex items-center justify-between text-sm">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Duration:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Category:</span>
                    <span className={`font-medium capitalize ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{getCategoryName(service.category)}</span>
                  </div>
                </div>

                <Link
                  to={`/service-booking/${service.id}`}
                  className="w-full btn-primary mb-4 flex items-center justify-center"
                >
                  <Icon icon={Icons.FiCalendar} className="w-4 h-4 mr-2" />
                  Book Now
                </Link>

                <button className="w-full btn-secondary">
                  Contact Us for Details
                </button>

                <div className={`mt-6 pt-6 border-t ${isDarkMode ? 'border-dark-600' : 'border-gray-200'}`}>
                  <div className={`flex items-center justify-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Icon icon={Icons.FiCheck} className="w-4 h-4 mr-1 text-green-500" />
                    Free consultation and quote
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetail;
