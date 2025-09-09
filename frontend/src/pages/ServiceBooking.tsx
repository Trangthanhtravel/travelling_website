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
  const { t, language, getLocalizedContent } = useTranslation();

  // Fetch service data with language support
  const { data: serviceData, isLoading } = useQuery({
    queryKey: ['service', slug, language],
    queryFn: () => servicesAPI.getServiceBySlug(slug!, language),
    enabled: !!slug,
  });

  const service = serviceData?.data;

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
      if (!service) throw new Error(t('Service not found'));

      // Create booking payload with all required fields
      const bookingPayload = {
        serviceId: parseInt(service.id), // Convert to number
        serviceSlug: slug,
        serviceTitle: getLocalizedContent(service, 'title') || service.title,
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

      return bookingsAPI.createDirectBooking(bookingPayload);
    },
    onSuccess: () => {
      toast.success(t('Booking submitted successfully! We will contact you shortly.'));
      navigate('/services');
    },
    onError: (error: any) => {
      toast.error(error.message || t('Failed to submit booking. Please try again.'));
    },
  });

  const onSubmit = (data: ServiceBookingFormData) => {
    createBookingMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-accent-orange"></div>
      </div>
    );
  }

  if (!service) {
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="bg-accent-orange text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('Book Service')}
            </h1>
            <p className="text-xl text-white/90">
              {getLocalizedContent(service, 'title') || service.title}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('Personal Information')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      {t('Full Name')} *
                    </label>
                    <input
                      type="text"
                      {...register('customerName', { required: t('Full name is required') })}
                      className={`w-full p-3 border rounded-lg ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400'
                          : 'border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                      placeholder={t('Enter your full name')}
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      {t('Email Address')} *
                    </label>
                    <input
                      type="email"
                      {...register('customerEmail', {
                        required: t('Email is required'),
                        pattern: {
                          value: /^\S+@\S+$/i,
                          message: t('Please enter a valid email address')
                        }
                      })}
                      className={`w-full p-3 border rounded-lg ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400'
                          : 'border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                      placeholder={t('Enter your email address')}
                    />
                    {errors.customerEmail && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerEmail.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      {t('Phone Number')} *
                    </label>
                    <input
                      type="tel"
                      {...register('customerPhone', { required: t('Phone number is required') })}
                      className={`w-full p-3 border rounded-lg ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400'
                          : 'border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                      placeholder={t('Enter your phone number')}
                    />
                    {errors.customerPhone && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerPhone.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      {t('Service Date')} *
                    </label>
                    <input
                      type="date"
                      {...register('startDate', { required: t('Service date is required') })}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full p-3 border rounded-lg ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-white'
                          : 'border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                    />
                    {errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('Service Details')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      {t('Adults')} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      {...register('adults', {
                        required: t('Number of adults is required'),
                        min: { value: 1, message: t('At least 1 adult is required') }
                      })}
                      className={`w-full p-3 border rounded-lg ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-white'
                          : 'border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                    />
                    {errors.adults && (
                      <p className="text-red-500 text-sm mt-1">{errors.adults.message}</p>
                    )}
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                      {t('Children')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      {...register('children')}
                      className={`w-full p-3 border rounded-lg ${
                        isDarkMode
                          ? 'bg-dark-700 border-dark-600 text-white'
                          : 'border-gray-300 text-gray-900'
                      } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                    />
                  </div>

                  {/* Car Rental Specific Fields */}
                  {service.service_type === 'car-rental' && (
                    <>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                          {t('Departure Location')}
                        </label>
                        <input
                          type="text"
                          {...register('departureLocation')}
                          className={`w-full p-3 border rounded-lg ${
                            isDarkMode
                              ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400'
                              : 'border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                          placeholder={t('Enter departure location')}
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                          {t('Destination Location')}
                        </label>
                        <input
                          type="text"
                          {...register('destinationLocation')}
                          className={`w-full p-3 border rounded-lg ${
                            isDarkMode
                              ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400'
                              : 'border-gray-300 text-gray-900'
                          } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                          placeholder={t('Enter destination location')}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            {...register('returnTrip')}
                            className="w-4 h-4 text-accent-orange border-gray-300 rounded focus:ring-accent-orange"
                          />
                          <label className={`ml-2 text-sm ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                            {t('Return Trip Required')}
                          </label>
                        </div>
                      </div>

                      {watchedValues.returnTrip && (
                        <div>
                          <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                            {t('Return Date')}
                          </label>
                          <input
                            type="date"
                            {...register('returnDate')}
                            min={watchedValues.startDate || new Date().toISOString().split('T')[0]}
                            className={`w-full p-3 border rounded-lg ${
                              isDarkMode
                                ? 'bg-dark-700 border-dark-600 text-white'
                                : 'border-gray-300 text-gray-900'
                            } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-dark-text-primary' : 'text-gray-700'}`}>
                    {t('Special Requests')}
                  </label>
                  <textarea
                    {...register('specialRequests')}
                    rows={3}
                    className={`w-full p-3 border rounded-lg ${
                      isDarkMode
                        ? 'bg-dark-700 border-dark-600 text-white placeholder-gray-400'
                        : 'border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-accent-orange focus:border-transparent`}
                    placeholder={t('Any special requests or additional information...')}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(`/services/${slug}`)}
                  className={`flex-1 py-3 px-6 border rounded-lg font-medium transition-colors duration-200 ${
                    isDarkMode
                      ? 'border-dark-600 text-dark-text-primary hover:bg-dark-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('Back')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-accent-orange hover:bg-accent-orange-dark text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('Submitting...') : t('Submit Booking')}
                </button>
              </div>
            </form>
          </div>

          {/* Service Summary */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-lg p-6 sticky top-8 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('Booking Summary')}
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {getLocalizedContent(service, 'title') || service.title}
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getLocalizedContent(service, 'subtitle') || service.subtitle}
                  </p>
                </div>

                {service.price && (
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-dark-600">
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {t('Price per person')}
                    </span>
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      ${service.price}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                    {t('Total Travelers')}
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {watchedValues.totalTravelers || 1}
                  </span>
                </div>

                {service.price && (
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-dark-600">
                    <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {t('Total Amount')}
                    </span>
                    <span className="font-bold text-accent-orange text-xl">
                      ${(service.price * (watchedValues.totalTravelers || 1)).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              <div className={`mt-6 p-4 rounded-lg ${isDarkMode ? 'bg-dark-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <Icon icon={Icons.FiInfo} className="w-4 h-4 inline mr-1" />
                  {t('You will receive a confirmation email with booking details and payment instructions.')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceBooking;
