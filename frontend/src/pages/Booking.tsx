import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toursAPI, bookingsAPI } from '../utils/api';
import { BookingForm } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';
import toast from 'react-hot-toast';

// Extended booking form for direct bookings
interface DirectBookingForm extends Omit<BookingForm, 'tourId' | 'travelers'> {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  totalTravelers: number;
}

const DirectBooking: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();
  const [pricing, setPricing] = useState<any>(null);

  const { data: response, isLoading: tourLoading } = useQuery({
    queryKey: ['tour-booking', slug],
    queryFn: () => toursAPI.getTourBySlug(slug!),
    enabled: !!slug,
  });

  // Extract the actual tour data from the API response with proper type checking
  const tourData: any = response?.data?.data || response?.data || null;

  const createBookingMutation = useMutation({
    mutationFn: bookingsAPI.createDirectBooking,
    onSuccess: (data) => {
      toast.success(`${t('Booking submitted successfully')}! ${t('We will contact you soon')}.`);
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('Something went wrong'));
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DirectBookingForm>({
    // Remove the resolver temporarily to avoid type conflicts
    mode: 'onBlur',
    defaultValues: {
      customerInfo: {
        name: '',
        email: '',
        phone: '',
      },
      startDate: '',
      numberOfTravelers: {
        adults: 1,
        children: 0,
        infants: 0,
      },
      totalTravelers: 1,
      specialRequests: '',
      emergencyContact: {
        name: '',
        phone: '',
        relationship: '',
      },
    },
  });

  const watchedValues = watch();

  // Calculate total travelers when individual counts change
  useEffect(() => {
    const { adults, children, infants } = watchedValues.numberOfTravelers || { adults: 1, children: 0, infants: 0 };
    const total = adults + children + infants;
    setValue('totalTravelers', total);
  }, [watchedValues.numberOfTravelers, setValue]);

  // Calculate pricing when form values change
  useEffect(() => {
    if (tourData && watchedValues.totalTravelers) {
      // Safely access price data with fallbacks
      const basePrice = tourData?.pricing?.basePrice || tourData?.price || 0;
      const totalAmount = basePrice * watchedValues.totalTravelers;
      setPricing({
        basePrice,
        totalTravelers: watchedValues.totalTravelers,
        totalAmount,
        currency: tourData?.pricing?.currency || 'USD',
      });
    }
  }, [tourData, watchedValues.totalTravelers]);

  const onSubmit = async (data: DirectBookingForm) => {
    if (!tourData) return;

    try {
      const bookingData = {
        tourId: tourData.id,
        tourSlug: slug,
        tourTitle: tourData.title,
        customerName: data.customerInfo.name,
        customerEmail: data.customerInfo.email,
        customerPhone: data.customerInfo.phone,
        startDate: data.startDate,
        adults: data.numberOfTravelers.adults,
        children: data.numberOfTravelers.children,
        infants: data.numberOfTravelers.infants,
        totalTravelers: data.totalTravelers,
        totalAmount: pricing?.totalAmount || 0,
        currency: pricing?.currency || 'USD',
        specialRequests: data.specialRequests,
        emergencyContactName: data.emergencyContact.name,
        emergencyContactPhone: data.emergencyContact.phone,
        emergencyContactRelationship: data.emergencyContact.relationship,
      };

      await createBookingMutation.mutateAsync(bookingData);
    } catch (error) {
      console.error('Booking submission error:', error);
    }
  };

  if (tourLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('Loading...')}</p>
        </div>
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Tour Not Found')}</h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{t('The tour you are looking for does not exist.')}</p>
          <button
            onClick={() => navigate('/tours')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('Browse Tours')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} py-8`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-6`}>
            <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>{t('Book Your Tour')}</h1>

            {/* Tour Summary with Image */}
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 mb-4`}>
              <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-3`}>{t('Tour Summary')}</h2>
              <div className="flex items-start space-x-4">
                <img
                  src={tourData.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'}
                  alt={tourData.title}
                  className="w-24 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>{tourData.title}</h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>{tourData.description?.substring(0, 100)}...</p>
                  <div className={`flex items-center space-x-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {tourData.duration && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12,6 12,12 16,14"></polyline>
                        </svg>
                        {tourData.duration}
                      </span>
                    )}
                    <span className="font-semibold text-blue-600">
                      {t('Starting from')} ${tourData.price}
                    </span>
                    {tourData.location && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {tourData.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Tour Details */}
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('Duration')}:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tourData.duration || `${tourData.duration_days || 'N/A'} ${t('days')}`}
                  </span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('Price per Person')}:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>${tourData.price}</span>
                </div>
                <div>
                  <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('Category')}:</span>
                  <span className={`ml-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{tourData.category || t('Standard')}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Booking Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Customer Information')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Full Name')} *
                      </label>
                      <input
                        type="text"
                        {...register('customerInfo.name', { required: t('Name is required') })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('Enter your full name')}
                      />
                      {errors.customerInfo?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerInfo.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Email Address')} *
                      </label>
                      <input
                        type="email"
                        {...register('customerInfo.email', {
                          required: t('Email is required'),
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: t('Invalid email')
                          }
                        })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('Enter your email')}
                      />
                      {errors.customerInfo?.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerInfo.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Phone Number')} *
                      </label>
                      <input
                        type="tel"
                        {...register('customerInfo.phone', { required: t('Phone is required') })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('Enter your phone number')}
                      />
                      {errors.customerInfo?.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerInfo.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Start Date')} *
                      </label>
                      <input
                        type="date"
                        {...register('startDate', { required: t('Date is required') })}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Number of Travelers */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Number of Travelers')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Adults')} (18+)
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...register('numberOfTravelers.adults', {
                          required: true,
                          min: 1,
                          valueAsNumber: true
                        })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Children')} (2-17)
                      </label>
                      <input
                        type="number"
                        min="0"
                        {...register('numberOfTravelers.children', {
                          min: 0,
                          valueAsNumber: true
                        })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Infants')} (0-2)
                      </label>
                      <input
                        type="number"
                        min="0"
                        {...register('numberOfTravelers.infants', {
                          min: 0,
                          valueAsNumber: true
                        })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`mt-4 p-3 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'} rounded-md`}>
                    <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-800'}`}>
                      {t('Total Travelers')}: <span className="font-medium">{watchedValues.totalTravelers || 1}</span>
                    </p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Emergency Contact')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Emergency Contact Name')}
                      </label>
                      <input
                        type="text"
                        {...register('emergencyContact.name')}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('Contact person name')}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Emergency Contact Phone')}
                      </label>
                      <input
                        type="tel"
                        {...register('emergencyContact.phone')}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('Contact phone number')}
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Relationship')}
                      </label>
                      <input
                        type="text"
                        {...register('emergencyContact.relationship')}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('e.g., Spouse, Parent')}
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Special Requests')}</h3>

                  <textarea
                    {...register('specialRequests')}
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder={t('Any special requirements, dietary restrictions, medical conditions, or other requests...')}
                  />
                </div>
              </div>

              {/* Booking Summary */}
              <div className="lg:col-span-1">
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 sticky top-6`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Booking Summary')}</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('Base Price')}:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${pricing?.basePrice || tourData.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('Number of Travelers')}:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{pricing?.totalTravelers || 1}</span>
                    </div>
                    <hr className={`${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} />
                    <div className="flex justify-between text-lg font-semibold">
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('Total Amount')}:</span>
                      <span className="text-blue-600">${pricing?.totalAmount || tourData.price}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? t('Processing...') : t('Book Now')}
                  </button>

                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-3 text-center`}>
                    {t('By clicking Book Now, you agree to our')}{' '}
                    <Link
                      to="/booking-policy"
                      className="text-blue-500 hover:text-blue-600 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('Terms of Service and Booking Policy')}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DirectBooking;
