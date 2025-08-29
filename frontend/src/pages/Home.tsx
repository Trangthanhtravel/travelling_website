import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Icon, Icons } from '../components/common/Icons';
import AnimatedCounter from '../components/common/AnimatedCounter';
import { useQuery } from '@tanstack/react-query';
import { toursAPI, servicesAPI } from '../utils/api';

interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

const Home: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [aboutContent, setAboutContent] = useState({
    backgroundImage: 'https://static.wixstatic.com/media/8fa70e_ca95c635557f41c7b98ac645bb27d085~mv2.jpg/v1/fill/w_675,h_312,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/This%20was%20indeed%20one-of-a-kind%20experience.jpg',
    quote: 'For over 15 years, Trang Thanh Travel has been a trusted companion, helping customers have smooth and memorable trips. From organizing tours, events, to renting private cars, making visas, or booking airline tickets, cruises, trains, hotels, we can take care of everything so that you have the most perfect experience.',
    tagline: '',
    title: '',
    description: '',
    youtubeId: '8VJpaYXrPPQ',
  });
  const [statisticsContent, setStatisticsContent] = useState({
    happyCustomers: 500,
    numberOfTrips: 1200,
    yearsOfExperience: 15,
    googleReview: 4.6
  });
  const [statisticsVisible, setStatisticsVisible] = useState(false);
  const statisticsRef = useRef<HTMLDivElement>(null);
  const carRentalsRef = useRef<HTMLDivElement>(null);
  const coreServicesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll functions
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


  // Fetch hero images from backend
  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/content/hero-images`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.length > 0) {
            // Transform content data to hero slides format
            const slides: HeroSlide[] = [];
            const images = data.data.filter((item: any) => item.key.startsWith('hero_image_'));

            for (let i = 0; i < images.length; i++) {
              const imageItem = images[i];
              const titleItem = data.data.find((item: any) => item.key === `hero_title_${i + 1}`);
              const subtitleItem = data.data.find((item: any) => item.key === `hero_subtitle_${i + 1}`);

              slides.push({
                id: imageItem.id,
                image: imageItem.content,
                title: titleItem?.content || `Hero ${i + 1}`,
                subtitle: subtitleItem?.content || '',
                description: '',
              });
            }

            if (slides.length > 0) {
              setHeroSlides(slides);
            } else {
              // Fallback to default images
              setHeroSlides(getDefaultHeroSlides());
            }
          } else {
            setHeroSlides(getDefaultHeroSlides());
          }
        } else {
          setHeroSlides(getDefaultHeroSlides());
        }
      } catch (error) {
        console.error('Error fetching hero images:', error);
        setHeroSlides(getDefaultHeroSlides());
      } finally {
        setHeroLoading(false);
      }
    };

    fetchHeroImages();
  }, []);

  // Default hero slides fallback
  const getDefaultHeroSlides = (): HeroSlide[] => [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Discover Amazing Vietnam',
      subtitle: 'Experience the beauty and culture of Southeast Asia',
      description: '',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Travel with Trang Thanh',
      subtitle: 'Professional travel services and unforgettable experiences',
      description: '',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      title: 'Cultural Immersion',
      subtitle: 'Dive deep into local traditions and customs',
      description: '',
    },
  ];

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  // Intersection Observer for statistics animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !statisticsVisible) {
          setStatisticsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (statisticsRef.current) {
      observer.observe(statisticsRef.current);
    }

    return () => observer.disconnect();
  }, [statisticsVisible]);

  // Fetch about section content
  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/content?type=setting`);
        if (response.ok) {
          const data = await response.json();
          const aboutData = data.data || [];

          const backgroundImage = aboutData.find((item: any) => item.key === 'about_background_image')?.content || 'https://static.wixstatic.com/media/8fa70e_ca95c635557f41c7b98ac645bb27d085~mv2.jpg/v1/fill/w_675,h_312,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/This%20was%20indeed%20one-of-a-kind%20experience.jpg%201x,%20https://static.wixstatic.com/media/8fa70e_ca95c635557f41c7b98ac645bb27d085~mv2.jpg/v1/fill/w_1350,h_624,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/This%20was%20indeed%20one-of-a-kind%20experience.jpg%202x';
          const quote = aboutData.find((item: any) => item.key === 'about_quote')?.content || 'For over 15 years, Trang Thanh Travel has been a trusted companion, helping customers have smooth and memorable trips. From organizing tours, events, to renting private cars, making visas, or booking airline tickets, cruises, trains, hotels, we can take care of everything so that you have the most perfect experience.';
          const tagline = aboutData.find((item: any) => item.key === 'about_tagline')?.content || 'Travel Beyond Boundaries';
          const title = aboutData.find((item: any) => item.key === 'about_title')?.content || 'About Our Journey';
          const description = aboutData.find((item: any) => item.key === 'about_description')?.content || 'Discover how we create extraordinary travel experiences that connect you with the world\'s most beautiful destinations and cultures.';
          const youtubeId = aboutData.find((item: any) => item.key === 'about_youtube_id')?.content || '8VJpaYXrPPQ';

          // Fetch statistics data
          const happyCustomers = parseInt(aboutData.find((item: any) => item.key === 'stats_happy_customers')?.content || '500');
          const numberOfTrips = parseInt(aboutData.find((item: any) => item.key === 'stats_number_of_trips')?.content || '1200');
          const yearsOfExperience = parseInt(aboutData.find((item: any) => item.key === 'stats_years_experience')?.content || '15');
          const googleReview = parseFloat(aboutData.find((item: any) => item.key === 'stats_google_review')?.content || '4.6');

          setAboutContent({
            backgroundImage,
            quote,
            tagline,
            title,
            description,
            youtubeId,
          });

          setStatisticsContent({
            happyCustomers,
            numberOfTrips,
            yearsOfExperience,
            googleReview
          });
        }
      } catch (error) {
        console.error('Error fetching about content:', error);
      }
    };

    fetchAboutContent();
  }, []);

  // Fetch featured blogs from backend
  const { data: featuredBlogsData, isLoading: blogsLoading } = useQuery({
    queryKey: ['featured-blogs'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/blogs/featured?limit=3`);
      if (!response.ok) throw new Error('Failed to fetch featured blogs');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const featuredBlogs = featuredBlogsData?.data || [];

  // Fetch featured tours from real API using the dedicated featured endpoint
  const { data: featuredToursData, isLoading: toursLoading } = useQuery({
    queryKey: ['featured-tours'],
    queryFn: async () => {
      const response = await toursAPI.getFeaturedTours();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const featuredTours = featuredToursData?.data || [];

  // Fetch featured categories from database
  const { data: featuredCategoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['featured-categories'],
    queryFn: async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/categories?featured=1&status=active`);
      if (!response.ok) throw new Error('Failed to fetch featured categories');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const featuredCategories = featuredCategoriesData?.data || [];

  // Fetch car rental services from real API
  const { data: carRentalsData, isLoading: carRentalsLoading } = useQuery({
    queryKey: ['car-rentals'],
    queryFn: async () => {
      const response = await servicesAPI.getServices();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter car rental services from all services
  const carRentals = (carRentalsData?.data || []).filter((service: any) =>
    service.service_type === 'car-rental'
  ).slice(0, 6); // Limit to 6 car rentals for homepage


  return (
    <div className={`transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-light-100'}`}>
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {heroLoading ? (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-500 text-lg">Loading...</div>
          </div>
        ) : (
          <div className="absolute inset-0">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
                  }}
                />
                {/* Light grey overlay to soften bright images */}
                <div className="absolute inset-0 bg-gray-900 bg-opacity-20"></div>
                {/* Dark gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30"></div>
              </div>
            ))}
          </div>
        )}

        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold font-serif mb-6 drop-shadow-lg">
                {heroSlides[currentSlide]?.title || 'Welcome'}
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-light-300 drop-shadow-md">
                {heroSlides[currentSlide]?.subtitle || ''}
              </p>
              <p className="text-lg mb-8 max-w-2xl mx-auto text-light-200 drop-shadow-md">
                {heroSlides[currentSlide]?.description || ''}
              </p>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-accent-orange' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section className={`py-20 transition-colors duration-200 ${isDarkMode ? 'bg-dark-800' : 'bg-light-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Company Quote with Nature Background */}
            <div className="relative">
              <div
                className="relative h-96 rounded-2xl overflow-hidden bg-cover bg-center shadow-2xl"
                style={{
                  backgroundImage: `url('${aboutContent.backgroundImage}')`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/30 to-dark-900/50"></div>
                <div className="relative z-10 h-full flex items-center justify-center p-8">
                  <div className="text-center text-dark-text-secondary">
                    <blockquote className="text-2xl md:text-3xl font-serif italic leading-relaxed mb-6 drop-shadow-lg">
                      "{aboutContent.quote}"
                    </blockquote>
                    <div className="flex items-center justify-center">
                      <div className="w-12 h-px bg-accent-orange mr-4"></div>
                      <p className="text-lg font-medium drop-shadow-md text-accent-orange">{aboutContent.tagline}</p>
                      <div className="w-12 h-px bg-accent-orange ml-4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - YouTube Video */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>{aboutContent.title}</h2>
                <p className={`text-lg mb-6 ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  {aboutContent.description}
                </p>
              </div>

              {/* YouTube Video Embed */}
              <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${aboutContent.youtubeId}?controls=1&modestbranding=1&rel=0`}
                  title="About Our Travel Company"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section
        ref={statisticsRef}
        className={`py-20 transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-white'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Happy Customers */}
            <div className="text-center group">
              <div className={`p-8 rounded-2xl transition-all duration-300 group-hover:scale-105 ${isDarkMode ? 'hover:bg-dark-700' : 'bg-light-50 hover:bg-light-100'} hover:shadow-xl`}>
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon={Icons.FiUsers} className="w-8 h-8 text-white" />
                </div>
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  <AnimatedCounter
                    end={statisticsContent.happyCustomers}
                    duration={2500}
                    suffix="+"
                    startAnimation={statisticsVisible}
                  />
                </div>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  Happy Customers
                </p>
              </div>
            </div>

            {/* Number of Trips */}
            <div className="text-center group">
              <div className={`p-8 rounded-2xl transition-all duration-300 group-hover:scale-105 ${isDarkMode ? 'hover:bg-dark-700' : 'bg-light-50 hover:bg-light-100'} hover:shadow-xl`}>
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon={Icons.FiMapPin} className="w-8 h-8 text-white" />
                </div>
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  <AnimatedCounter
                    end={statisticsContent.numberOfTrips}
                    duration={2800}
                    suffix="+"
                    startAnimation={statisticsVisible}
                  />
                </div>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  Successful Trips
                </p>
              </div>
            </div>

            {/* Years of Experience */}
            <div className="text-center group">
              <div className={`p-8 rounded-2xl transition-all duration-300 group-hover:scale-105 ${isDarkMode ? ' hover:bg-dark-700' : 'bg-light-50 hover:bg-light-100'} hover:shadow-xl`}>
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon={Icons.FiCalendar} className="w-8 h-8 text-white" />
                </div>
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  <AnimatedCounter
                    end={statisticsContent.yearsOfExperience}
                    duration={2000}
                    suffix="+"
                    startAnimation={statisticsVisible}
                  />
                </div>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  Years Experience
                </p>
              </div>
            </div>

            {/* Google Review */}
            <div className="text-center group">
              <div className={`p-8 rounded-2xl transition-all duration-300 group-hover:scale-105 ${isDarkMode ? 'hover:bg-dark-700' : 'bg-light-50 hover:bg-light-100'} hover:shadow-xl`}>
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon icon={Icons.FiStar} className="w-8 h-8 text-white" />
                </div>
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${isDarkMode ? 'text-dark-text-secondary' : 'text-light-text-primary'}`}>
                  <AnimatedCounter
                    end={statisticsContent.googleReview}
                    duration={2200}
                    decimals={1}
                    startAnimation={statisticsVisible}
                  />
                </div>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-dark-text-muted' : 'text-light-text-muted'}`}>
                  Google Rating
                </p>
                <div className="flex justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Icon
                      key={star}
                      icon={Icons.FiStar}
                      className={`w-4 h-4 ${star <= Math.floor(statisticsContent.googleReview) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className={`py-20 transition-colors duration-200 ${isDarkMode ? 'bg-light-50' : 'bg-light-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-light-text-primary mb-4">Our Core Services</h2>
            <p className="text-xl text-light-text-muted max-w-2xl mx-auto">
              Comprehensive travel solutions to make your journey seamless and memorable
            </p>
          </div>

          {/* Scrollable Services List */}
          <div className="relative">
            {categoriesLoading ? (
              <div className="flex space-x-6 pb-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex-none w-80 bg-white rounded-xl shadow-lg animate-pulse">
                    <div className="h-48 bg-gray-300 rounded-t-xl"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide" ref={coreServicesRef}>
                <div className="flex space-x-6 pb-4">
                  {featuredCategories.length > 0 ? featuredCategories.map((category, index) => {
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
                      <div
                        key={category.id || index}
                        className="flex-none w-80 bg-white dark:bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-300 group hover:shadow-2xl transition-all duration-300"
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
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900 mb-2">
                            {category.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-600 text-sm mb-4 line-clamp-2">
                            {category.description}
                          </p>
                          <button
                            onClick={() => {
                              // Navigate to tours or services page based on category type
                              if (category.type === 'tour') {
                                navigate(`/tours?category=${category.slug}`);
                              } else if (category.type === 'service') {
                                navigate(`/services?category=${category.slug}`);
                              } else if (category.type === 'both') {
                                // For categories that apply to both, redirect to services by default
                                // You could also show a modal to let users choose
                                navigate(`/services?category=${category.slug}`);
                              } else {
                                // Fallback to services page
                                navigate(`/services?category=${category.slug}`);
                              }
                            }}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition-colors duration-200"
                          >
                            Learn More
                          </button>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="flex-none w-80 bg-white rounded-xl shadow-lg p-6 text-center">
                      <p className="text-gray-500">No featured services available at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scroll buttons */}
            <button
              onClick={() => scrollLeft(coreServicesRef)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-100 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors duration-200 z-10 border border-gray-200 dark:border-gray-300"
            >
              <Icon icon={Icons.FiChevronLeft} className="w-6 h-6 text-gray-600 dark:text-gray-700" />
            </button>
            <button
              onClick={() => scrollRight(coreServicesRef)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-100 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors duration-200 z-10 border border-gray-200 dark:border-gray-300"
            >
              <Icon icon={Icons.FiChevronRight} className="w-6 h-6 text-gray-600 dark:text-gray-700" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="py-20 bg-white dark:bg-dark-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Tours</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our handpicked collection of extraordinary tours and experiences
            </p>
          </div>

          {toursLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-dark-700 rounded-xl shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-dark-600 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 dark:bg-dark-600 rounded mb-2"></div>
                    <div className="h-6 bg-gray-300 dark:bg-dark-600 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-dark-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredTours?.slice(0, 3).map((tour) => (
                <div key={tour.id} className="bg-white dark:bg-dark-850 rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 border dark:border-dark-600">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={tour.image_url || tour.images?.[0] || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-white dark:bg-dark-800 rounded-full px-3 py-1 text-sm font-medium text-primary-600 dark:text-primary-400">
                      ${tour.price}
                    </div>
                    {tour.featured && (
                      <div className="absolute top-4 left-4 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 mb-2">
                      <Icon icon={Icons.FiMapPin} className="w-4 h-4 mr-1" />
                      <span>{tour.location}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                      {tour.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-600 text-sm mb-4 line-clamp-2">
                      {tour.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                        <Icon icon={Icons.FiClock} className="w-4 h-4 mr-1" />
                        <span>{tour.duration}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                        <Icon icon={Icons.FiUsers} className="w-4 h-4 mr-1" />
                        <span>Max {tour.max_participants}</span>
                      </div>
                    </div>
                    <Link
                      to={`/tours/${tour.slug || tour.id}`}
                      className="inline-flex items-center justify-center w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    >
                      View Details
                      <Icon icon={Icons.FiArrowRight} className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/tours"
              className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              View All Tours
              <Icon icon={Icons.FiArrowRight} className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Car Rentals Section - Make this WHITE in dark mode too */}
      <section className="py-20 bg-gray-50 dark:bg-white transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-900 mb-4">Car Rentals</h2>
            <p className="text-xl text-gray-600 dark:text-gray-600 max-w-2xl mx-auto">
              Choose from our premium fleet
            </p>
          </div>

          <div className="relative">
            {carRentalsLoading ? (
              <div className="flex space-x-6 pb-4">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="flex-none w-80 bg-white rounded-xl shadow-lg animate-pulse">
                    <div className="h-48 bg-gray-300 rounded-t-xl"></div>
                    <div className="p-6">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide" ref={carRentalsRef}>
                <div className="flex space-x-6 pb-4">
                  {carRentals.length > 0 ? carRentals.map((car, index) => (
                    <div key={car.id || index} className="flex-none w-80 bg-white dark:bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-300">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={car.images ? (typeof car.images === 'string' ? JSON.parse(car.images)[0] : car.images[0]) : 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                          alt={car.title}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1549924231-f129b911e442?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                          }}
                        />
                        <div className="absolute top-4 right-4 bg-white dark:bg-gray-100 text-gray-900 dark:text-gray-900 px-3 py-1 rounded-full text-sm font-medium border border-gray-200 dark:border-gray-300">
                          ${car.price}/{car.duration || 'day'}
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900 mb-2">{car.title}</h3>
                        <p className="text-gray-600 dark:text-gray-600 text-sm mb-4 line-clamp-2">{car.subtitle || car.description}</p>
                        <Link
                          to={`/services/${car.slug || car.id}`}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium transition-colors duration-200 block text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  )) : (
                    <div className="flex-none w-80 bg-white rounded-xl shadow-lg p-6 text-center">
                      <p className="text-gray-500">No car rentals available at the moment.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Scroll buttons for car rentals */}
            <button
              onClick={() => scrollLeft(carRentalsRef)}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-100 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors duration-200 z-10 border border-gray-200 dark:border-gray-300"
            >
              <Icon icon={Icons.FiChevronLeft} className="w-6 h-6 text-gray-600 dark:text-gray-700" />
            </button>
            <button
              onClick={() => scrollRight(carRentalsRef)}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-100 shadow-lg rounded-full p-3 hover:bg-gray-50 dark:hover:bg-gray-200 transition-colors duration-200 z-10 border border-gray-200 dark:border-gray-300"
            >
              <Icon icon={Icons.FiChevronRight} className="w-6 h-6 text-gray-600 dark:text-gray-700" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Blogs Section */}
      <section className={`py-20 transition-colors duration-200 ${isDarkMode ? 'bg-dark-900' : 'bg-light-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-light-text-primary dark:text-white">
              Featured Blogs
            </h2>
            <p className="text-xl text-light-text-muted max-w-2xl mx-auto">
              Insights and stories from our travel experts
            </p>
          </div>

          {blogsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-dark-700 rounded-xl shadow-lg animate-pulse">
                  <div className="h-48 bg-gray-300 dark:bg-dark-600 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 dark:bg-dark-600 rounded mb-2"></div>
                    <div className="h-6 bg-gray-300 dark:bg-dark-600 rounded mb-4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-dark-600 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredBlogs.map((blog) => (
                <div key={blog.id} className="bg-white dark:bg-dark-850 rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 border dark:border-dark-600">
                  <Link to={`/blog/${blog.slug}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={blog.image_url || `https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                        alt={blog.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-900 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                        {blog.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-600 text-sm mb-4 line-clamp-2">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-500">
                        <Icon icon={Icons.FiCalendar} className="w-4 h-4 mr-1" />
                        <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/blogs"
              className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              View All Blogs
              <Icon icon={Icons.FiArrowRight} className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-800 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready for Your Next Adventure?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered amazing destinations with us. Start planning your perfect trip today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tours"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200"
            >
              Browse Tours
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-primary-600 transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
