import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';
import { Icon, Icons } from '../components/common/Icons';

const About: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const servicesRef = useRef<HTMLDivElement>(null);

  // Scroll functions for services section
  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Fetch editable About Us content
  const { data: aboutHistoryData, isLoading: historyLoading } = useQuery({
    queryKey: ['about-us-history'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/content/about_us_history`);
      if (!response.ok) throw new Error('Failed to fetch about us history');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: aboutImageData } = useQuery({
    queryKey: ['about-us-image'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/content/about_us_image`);
      if (!response.ok) throw new Error('Failed to fetch about us image');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: aboutVisionData } = useQuery({
    queryKey: ['about-us-vision'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/content/about_us_vision`);
      if (!response.ok) throw new Error('Failed to fetch about us vision');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: aboutMissionData } = useQuery({
    queryKey: ['about-us-mission'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/content/about_us_mission`);
      if (!response.ok) throw new Error('Failed to fetch about us mission');
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch featured categories from database for the "What We Do" section
  const { data: featuredCategoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['featured-categories-about'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/categories?featured=1&status=active`);
      if (!response.ok) throw new Error('Failed to fetch featured categories');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const featuredCategories = featuredCategoriesData?.data || [];
  const aboutHistory = aboutHistoryData?.data?.content || '';
  const aboutImage = aboutImageData?.data?.content || 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  const aboutVision = aboutVisionData?.data?.content || '';
  const aboutMission = aboutMissionData?.data?.content || '';

  // Map category icons to actual icons
  const getIconByName = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'map-pin': Icons.FiMapPin,
      'globe': Icons.FiGlobe,
      'plane': Icons.FiNavigation,
      'car': Icons.FiTruck,
      'file-text': Icons.FiFileText,
      'truck': Icons.FiTruck,
      'home': Icons.FiHome,
      'anchor': Icons.FiAnchor,
      'navigation': Icons.FiNavigation,
    };
    return iconMap[iconName] || Icons.FiMapPin;
  };

  // Generate appropriate image based on category type
  const getImageByCategory = (categoryName: string) => {
    const imageMap: { [key: string]: string } = {
      'domestic tours': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'inbound tours': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'outbound tours': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'car rental': 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'visa services': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'transportation': 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      'hotel booking': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    };
    return imageMap[categoryName.toLowerCase()] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="bg-accent-orange text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('About Us')}</h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              {t('Learn more about our company and our commitment to excellence')}
            </p>
          </div>
        </div>
      </div>

      {/* First Section - History (No Title) */}
      <section className={`py-20 transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text Content */}
            <div className="space-y-6">
              {historyLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className={`h-4 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
                  <div className={`h-4 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
                  <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
                  <div className={`h-4 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
                  <div className={`h-4 rounded w-5/6 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
                </div>
              ) : (
                <div className={`text-lg leading-relaxed ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: aboutHistory.replace(/\n/g, '<br />')
                    }}
                  />
                </div>
              )}
            </div>

            {/* Right side - Image */}
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={aboutImage}
                  alt="Trang Thanh Travel History"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-lg font-semibold">15+ Years of Excellence</p>
                  <p className="text-sm opacity-90">Serving travelers since 2009</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Second Section - Vision and Mission */}
      <section className={`py-20 transition-colors duration-200 ${isDarkMode ? 'bg-dark-800' : 'bg-gray-100'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-4xl font-bold mb-16 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
            {t('Our Vision')} & {t('Our Mission')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Vision */}
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-dark-900 border border-dark-700' : 'bg-white shadow-lg'}`}>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon={Icons.FiEye} className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
                {t('Our Vision')}
              </h3>
              <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                {aboutVision}
              </p>
            </div>

            {/* Mission */}
            <div className={`p-8 rounded-2xl ${isDarkMode ? 'bg-dark-900 border border-dark-700' : 'bg-white shadow-lg'}`}>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon icon={Icons.FiTarget} className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
                {t('Our Mission')}
              </h3>
              <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                {aboutMission}
              </p>
            </div>
          </div>

          {/* Values */}
          <div className="mt-16">
            <h3 className={`text-2xl font-bold mb-8 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
              {t('Our Values')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-dark-900 border border-dark-700' : 'bg-white shadow-md'}`}>
                <Icon icon={Icons.FiHeart} className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>Passion</h4>
                <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                  We are passionate about travel and dedicated to sharing that enthusiasm with every customer.
                </p>
              </div>
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-dark-900 border border-dark-700' : 'bg-white shadow-md'}`}>
                <Icon icon={Icons.FiShield} className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>Trust</h4>
                <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                  We build lasting relationships based on trust, transparency, and reliable service delivery.
                </p>
              </div>
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-dark-900 border border-dark-700' : 'bg-white shadow-md'}`}>
                <Icon icon={Icons.FiAward} className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>Excellence</h4>
                <p className={`text-sm ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                  We strive for excellence in every aspect of our service, from planning to execution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Third Section - What We Do */}
      <section className={`py-20 transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
              {t('What We Do')}
            </h2>
            <p className={`text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
              {t('Our professional travel services designed to make your journey unforgettable')}
            </p>
          </div>

          {/* Services Slider */}
          <div className="relative">
            {categoriesLoading ? (
              <div className="flex space-x-6 pb-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className={`flex-none w-80 rounded-xl shadow-lg animate-pulse ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
                    <div className={`h-48 rounded-t-xl ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
                    <div className="p-6">
                      <div className={`h-4 rounded mb-2 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
                      <div className={`h-6 rounded mb-4 ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
                      <div className={`h-4 rounded ${isDarkMode ? 'bg-dark-700' : 'bg-gray-300'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide" ref={servicesRef}>
                <div className="flex space-x-6 pb-4">
                  {featuredCategories.length > 0 ? featuredCategories.map((category, index) => (
                    <div
                      key={category.id || index}
                      className={`flex-none w-80 rounded-xl shadow-lg overflow-hidden border group hover:shadow-2xl transition-all duration-300 ${
                        isDarkMode ? 'bg-dark-800 border-dark-700' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={getImageByCategory(category.name)}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div
                          className="absolute top-4 left-4 text-white p-2 rounded-lg"
                          style={{ backgroundColor: category.color || '#3B82F6' }}
                        >
                          <Icon icon={getIconByName(category.icon)} className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-gray-900'}`}>
                          {category.name}
                        </h3>
                        <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-dark-text-muted' : 'text-gray-600'}`}>
                          {category.description}
                        </p>
                        <button
                          onClick={() => {
                            // Navigate to tours or services page based on category type
                            if (category.type === 'tour') {
                              navigate(`/tours?category=${category.slug}`);
                            } else if (category.type === 'service') {
                              // Check if this is a car rental category
                              if (category.name && category.name.toLowerCase().includes('car rental')) {
                                navigate('/car-rental');
                              } else {
                                navigate(`/services?category=${category.slug}`);
                              }
                            } else if (category.type === 'both') {
                              // For categories that apply to both, check if it's car rental
                              if (category.name && category.name.toLowerCase().includes('car rental')) {
                                navigate('/car-rental');
                              } else {
                                navigate(`/services?category=${category.slug}`);
                              }
                            } else {
                              // Check if this is a car rental category in fallback
                              if (category.name && category.name.toLowerCase().includes('car rental')) {
                                navigate('/car-rental');
                              } else {
                                navigate(`/services?category=${category.slug}`);
                              }
                            }
                          }}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition-colors duration-200"
                        >
                          Learn More
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className={`flex-none w-80 rounded-xl shadow-lg p-6 text-center ${isDarkMode ? 'bg-dark-800' : 'bg-white'}`}>
                      <p className={isDarkMode ? 'text-dark-text-muted' : 'text-gray-500'}>
                        No services available at the moment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scroll buttons */}
            <button
              onClick={() => scrollLeft(servicesRef)}
              className={`absolute left-0 top-1/2 -translate-y-1/2 shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 z-10 border ${
                isDarkMode 
                  ? 'bg-dark-800 border-dark-700 hover:bg-dark-700' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <Icon icon={Icons.FiChevronLeft} className={`w-6 h-6 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-600'}`} />
            </button>
            <button
              onClick={() => scrollRight(servicesRef)}
              className={`absolute right-0 top-1/2 -translate-y-1/2 shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors duration-200 z-10 border ${
                isDarkMode 
                  ? 'bg-dark-800 border-dark-700 hover:bg-dark-700' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <Icon icon={Icons.FiChevronRight} className={`w-6 h-6 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-600'}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-800 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who have discovered amazing destinations with us.
            Let us help you create your perfect travel experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/tours')}
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Explore Tours
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors duration-200"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
