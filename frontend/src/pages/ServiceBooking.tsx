import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Icon, Icons } from '../components/common/Icons';
import { servicesAPI, bookingsAPI } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../contexts/TranslationContext';
import toast from 'react-hot-toast';

// Service booking form interface aligned with backend
interface ServiceBookingFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  adults: number;
  children: number;
  totalTravelers: number;
  specialRequests?: string;
  // Service-specific fields
  serviceType?: string;
  departureLocation?: string;
  destinationLocation?: string;
  returnTrip?: boolean;
  returnDate?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
}

const ServiceBooking: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { t } = useTranslation();

  // Fetch service data
  const { data: serviceData, isLoading } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => servicesAPI.getServiceBySlug(slug!),
    enabled: !!slug,
  });

  const service = serviceData?.data.data;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceBookingFormData>({
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      startDate: '',
      adults: 1,
      children: 0,
      totalTravelers: 1,
      specialRequests: '',
      returnTrip: false,
    },
  });

  const watchedValues = watch();

  // Calculate total travelers when individual counts change
  React.useEffect(() => {
    const total = (watchedValues.adults || 0) + (watchedValues.children || 0);
    setValue('totalTravelers', total);
  }, [watchedValues.adults, watchedValues.children, setValue]);

  const createBookingMutation = useMutation({
    mutationFn: async (formData: ServiceBookingFormData) => {
      if (!service) throw new Error('Service not found');

      // Create booking payload with all required fields
      const bookingPayload = {
        serviceId: parseInt(service.id), // Convert to number
        serviceSlug: slug,
        serviceTitle: service.title,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        startDate: formData.startDate,
        adults: formData.adults,
        children: formData.children,
        infants: 0,
        totalTravelers: formData.totalTravelers,
        totalAmount: (service.price || 0) * formData.totalTravelers,
        currency: 'USD',
        specialRequests: formData.specialRequests || '',
        // Additional personal information
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        // Car rental specific fields
        departureLocation: formData.departureLocation,
        destinationLocation: formData.destinationLocation,
        returnTrip: formData.returnTrip,
        returnDate: formData.returnDate,
      };

      return await bookingsAPI.createDirectBooking(bookingPayload);
    },
    onSuccess: (response) => {
      toast.success(`${t('Booking submitted successfully')}! ${t('We will contact you soon')}.`);
      navigate('/services');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('Something went wrong'));
    },
  });

  const onSubmit = (data: ServiceBookingFormData) => {
    createBookingMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{t('Loading...')}</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Service Not Found')}</h2>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{t('The service you are looking for does not exist.')}</p>
          <button
            onClick={() => navigate('/services')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('Browse Services')}
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
          <div className="mb-8">
            <Link
              to={`/services/${slug}`}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
            >
              <Icon icon={Icons.FiArrowLeft} className="w-4 h-4 mr-1" />
              {t('Back to Service Details')}
            </Link>
          </div>

          {/* Service Summary */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 mb-6`}>
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Service Summary')}</h2>
            <div className="flex items-start space-x-4">
              <img
                src={service.image || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'}
                alt={service.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.title}</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{service.subtitle}</p>
                <div className={`mt-2 flex items-center space-x-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {service.duration && (
                    <span className="flex items-center">
                      <Icon icon={Icons.FiClock} className="w-4 h-4 mr-1" />
                      {service.duration}
                    </span>
                  )}
                  <span className="font-semibold text-blue-600">
                    {t('Starting from')} ${service.price}
                  </span>
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
                        {...register('customerName', { required: t('Name is required') })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('Enter your full name')}
                      />
                      {errors.customerName && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Email Address')} *
                      </label>
                      <input
                        type="email"
                        {...register('customerEmail', {
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
                      {errors.customerEmail && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Phone Number')} *
                      </label>
                      <input
                        type="tel"
                        {...register('customerPhone', { required: t('Phone is required') })}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                        placeholder={t('Enter your phone number')}
                      />
                      {errors.customerPhone && (
                        <p className="mt-1 text-sm text-red-600">{errors.customerPhone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Service Date')} *
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

                {/* Number of People */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Number of People')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Adults')} (18+)
                      </label>
                      <input
                        type="number"
                        min="1"
                        {...register('adults', {
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
                        {...register('children', {
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
                      {t('Total People')}: <span className="font-medium">{watchedValues.totalTravelers || 1}</span>
                    </p>
                  </div>
                </div>

                {/* Service-Specific Fields for Car Rental */}
                {service.category === 'car-rental' && (
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                    <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Trip Details')}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                          {t('From')} *
                        </label>
                        <input
                          type="text"
                          {...register('departureLocation', { required: t('Pick-up location is required') })}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder={t('Enter pick-up location')}
                        />
                        {errors.departureLocation && (
                          <p className="mt-1 text-sm text-red-600">{errors.departureLocation.message}</p>
                        )}
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                          {t('To')} *
                        </label>
                        <input
                          type="text"
                          {...register('destinationLocation', { required: t('Drop-off location is required') })}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder={t('Enter drop-off location')}
                        />
                        {errors.destinationLocation && (
                          <p className="mt-1 text-sm text-red-600">{errors.destinationLocation.message}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('returnTrip')}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{t('Return Trip Required')}</span>
                        </label>
                      </div>

                      {watchedValues.returnTrip && (
                        <div>
                          <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                            {t('Return Date')} *
                          </label>
                          <input
                            type="date"
                            {...register('returnDate', { required: watchedValues.returnTrip ? t('Return date is required') : false })}
                            min={watchedValues.startDate || new Date().toISOString().split('T')[0]}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              isDarkMode 
                                ? 'bg-gray-700 border-gray-600 text-white' 
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                          />
                          {errors.returnDate && (
                            <p className="mt-1 text-sm text-red-600">{errors.returnDate.message}</p>
                          )}
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                          {t('Let us know the details of your trip')}
                        </label>
                        <textarea
                          {...register('specialRequests')}
                          rows={4}
                          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDarkMode 
                              ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                          placeholder={t('Please provide details about your trip, special requirements, or any other information that would help us serve you better...')}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Additional Information')}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Gender')}
                      </label>
                      <select
                        {...register('gender')}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">{t('Select gender')}</option>
                        <option value="male">{t('Male')}</option>
                        <option value="female">{t('Female')}</option>
                        <option value="other">{t('Other')}</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        {t('Date of Birth')}
                      </label>
                      <input
                        type="date"
                        {...register('dateOfBirth')}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      {t('Address')} ({t('Optional')})
                    </label>
                    <input
                      type="text"
                      {...register('address')}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('Enter your address')}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      {t('Special Requests')}
                    </label>
                    <textarea
                      {...register('specialRequests')}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder={t('Any special requirements or requests...')}
                    />
                  </div>
                </div>
              </div>

              {/* Booking Summary */}
              <div className="lg:col-span-1">
                <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm p-6 sticky top-6`}>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4`}>{t('Booking Summary')}</h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('Service')}:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('Base Price')}:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>${service.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('Number of People')}:</span>
                      <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{watchedValues.totalTravelers || 1}</span>
                    </div>
                    <hr className={`${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`} />
                    <div className="flex justify-between text-lg font-semibold">
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{t('Total Amount')}:</span>
                      <span className="text-blue-600">${(service.price || 0) * (watchedValues.totalTravelers || 1)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? t('Processing...') : t('Book Service')}
                  </button>

                  <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-3 text-center`}>
                    {t('By clicking Book Service, you agree to our')}{' '}
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

export default ServiceBooking;
