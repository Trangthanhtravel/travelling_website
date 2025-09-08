import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toursAPI, bookingsAPI } from '../utils/api';
import { BookingForm } from '../types';
import { Icon, Icons } from '../components/common/Icons';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('Loading...')}</p>
        </div>
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('Tour Not Found')}</h2>
          <p className="text-gray-600 mb-4">{t('The tour you are looking for does not exist.')}</p>
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('Book Your Tour')}</h1>
            <h2 className="text-xl text-blue-600 mb-4">{tourData.title}</h2>

            {/* Tour Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">{t('Duration')}:</span>
                  <span className="ml-2 text-gray-600">
                    {tourData.duration_days} {t('days')} / {tourData.duration_days - 1} {t('nights')}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('Price per Person')}:</span>
                  <span className="ml-2 text-gray-600">${tourData.price}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">{t('Tour Type')}:</span>
                  <span className="ml-2 text-gray-600">{tourData.difficulty || t('Standard')}</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Booking Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Customer Information')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Full Name')} *
                      </label>
                      <input
                        type="text"
                        {...register('customerInfo.name', { required: t('Name is required') })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('Enter your full name')}
                      />
                      {errors.customerInfo?.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerInfo.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('Enter your email')}
                      />
                      {errors.customerInfo?.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerInfo.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Phone Number')} *
                      </label>
                      <input
                        type="tel"
                        {...register('customerInfo.phone', { required: t('Phone is required') })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('Enter your phone number')}
                      />
                      {errors.customerInfo?.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerInfo.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Start Date')} *
                      </label>
                      <input
                        type="date"
                        {...register('startDate', { required: t('Date is required') })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {errors.startDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Number of Travelers */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Number of Travelers')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Children')} (2-17)
                      </label>
                      <input
                        type="number"
                        min="0"
                        {...register('numberOfTravelers.children', {
                          min: 0,
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Infants')} (0-2)
                      </label>
                      <input
                        type="number"
                        min="0"
                        {...register('numberOfTravelers.infants', {
                          min: 0,
                          valueAsNumber: true
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      {t('Total Travelers')}: <span className="font-medium">{watchedValues.totalTravelers || 1}</span>
                    </p>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Emergency Contact')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Emergency Contact Name')}
                      </label>
                      <input
                        type="text"
                        {...register('emergencyContact.name')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('Contact person name')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Emergency Contact Phone')}
                      </label>
                      <input
                        type="tel"
                        {...register('emergencyContact.phone')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('Contact phone number')}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('Relationship')}
                      </label>
                      <input
                        type="text"
                        {...register('emergencyContact.relationship')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('e.g., Spouse, Parent')}
                      />
                    </div>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Special Requests')}</h3>

                  <textarea
                    {...register('specialRequests')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={t('Any special requirements, dietary restrictions, medical conditions, or other requests...')}
                  />
                </div>
              </div>

              {/* Booking Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('Booking Summary')}</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('Base Price')}:</span>
                      <span className="font-medium">${pricing?.basePrice || tourData.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('Number of Travelers')}:</span>
                      <span className="font-medium">{pricing?.totalTravelers || 1}</span>
                    </div>
                    <hr className="border-gray-200" />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t('Total Amount')}:</span>
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

                  <p className="text-xs text-gray-500 mt-3 text-center">
                    {t('By clicking Book Now, you agree to our Terms of Service and Privacy Policy')}
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
