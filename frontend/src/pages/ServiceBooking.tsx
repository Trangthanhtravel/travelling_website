import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Icon, Icons } from '../components/common/Icons';
import { servicesAPI, bookingsAPI } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';
import { ServiceBookingForm } from '../types';
import toast from 'react-hot-toast';

// Validation schemas for different service types
const baseSchema = {
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  gender: yup.string().oneOf(['male', 'female', 'other']).required('Gender is required'),
  dateOfBirth: yup.string().optional(),
  phone: yup.string().required('Phone number is required'),
  address: yup.string().optional(),
  passengers: yup.object({
    adults: yup.number().min(1, 'At least 1 adult required').required(),
    children: yup.number().min(0).required(),
  }).required(),
};

const tourSchema = yup.object({
  ...baseSchema,
  serviceType: yup.string().equals(['tours']).required(),
  departureDate: yup.string().required('Departure date is required'),
});

const carRentalSchema = yup.object({
  ...baseSchema,
  serviceType: yup.string().equals(['car-rental']).required(),
  departureDate: yup.string().required('Departure date is required'),
  from: yup.string().required('Departure location is required'),
  to: yup.string().required('Destination is required'),
  returnTrip: yup.boolean().required(),
  returnDate: yup.string().when('returnTrip', {
    is: true,
    then: (schema) => schema.required('Return date is required'),
    otherwise: (schema) => schema.optional(),
  }),
  tripDetails: yup.string().required('Trip details are required'),
});

const otherServiceSchema = yup.object({
  ...baseSchema,
  serviceType: yup.string().equals(['other-services']).required(),
  departureDate: yup.string().optional(),
  requestDetails: yup.string().required('Request details are required'),
});

const ServiceBooking: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  // Fetch service data
  const { data: serviceData, isLoading } = useQuery({
    queryKey: ['service', slug],
    queryFn: () => servicesAPI.getServiceBySlug(slug!),
    enabled: !!slug,
  });

  const service = serviceData?.data.data;

  // Determine which schema to use based on service category
  const getSchema = () => {
    if (!service) return tourSchema;
    switch (service.category) {
      case 'tours': return tourSchema;
      case 'car-rental': return carRentalSchema;
      default: return otherServiceSchema;
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ServiceBookingForm>({
    resolver: yupResolver(getSchema()) as any,
    defaultValues: {
      serviceId: slug || '',
      serviceType: service?.category || 'tours',
      passengers: { adults: 1, children: 0 },
      returnTrip: false,
    }
  });

  const watchReturnTrip = watch('returnTrip');

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: ServiceBookingForm) => {
      // Transform data to match the database schema and backend API
      const totalTravelers = bookingData.passengers.adults + bookingData.passengers.children;

      // Build special requests from various fields
      const specialRequestsParts = [];
      if (bookingData.requestDetails) specialRequestsParts.push(`Service Requirements: ${bookingData.requestDetails}`);
      if (bookingData.tripDetails) specialRequestsParts.push(`Trip Details: ${bookingData.tripDetails}`);
      if (bookingData.from && bookingData.to) specialRequestsParts.push(`Route: ${bookingData.from} to ${bookingData.to}`);
      if (bookingData.returnTrip && bookingData.returnDate) specialRequestsParts.push(`Return Trip: ${bookingData.returnDate}`);
      if (bookingData.gender) specialRequestsParts.push(`Gender: ${bookingData.gender}`);
      if (bookingData.dateOfBirth) specialRequestsParts.push(`Date of Birth: ${bookingData.dateOfBirth}`);
      if (bookingData.address) specialRequestsParts.push(`Address: ${bookingData.address}`);

      const bookingPayload = {
        type: 'service' as const,
        itemId: slug!,
        customerInfo: {
          name: bookingData.name,
          email: bookingData.email,
          phone: bookingData.phone,
        },
        bookingDetails: {
          startDate: bookingData.departureDate || new Date().toISOString().split('T')[0],
          totalTravelers,
          specialRequests: specialRequestsParts.join('; '),
        },
        pricing: {
          totalAmount: service?.price || 0,
          currency: 'USD',
        },
      };

      return await bookingsAPI.createDirectBooking(bookingPayload);
    },
    onSuccess: (data) => {
      toast.success('Booking request submitted successfully! Our team will contact you shortly.');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Failed to submit booking request');
    },
  });

  const onSubmit = (data: ServiceBookingForm) => {
    createBookingMutation.mutate(data);
  };

  if (isLoading || !service) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderServiceSummary = () => (
    <div className={`rounded-lg shadow-lg p-6 mb-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
      <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Service Summary</h2>
      <div className="flex items-start space-x-4">
        <img
          src={service.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e'}
          alt={service.title}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{service.title}</h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{service.subtitle}</p>
          <div className={`mt-2 flex items-center space-x-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {service.duration && (
              <span className="flex items-center">
                <Icon icon={Icons.FiClock} className="w-4 h-4 mr-1" />
                {service.duration}
              </span>
            )}
            <span className="font-semibold text-primary-600">${service.price}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-dark-900' : 'bg-gray-50'} py-8`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to={`/services/${slug}`} className={`flex items-center text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
            <Icon icon={Icons.FiArrowLeft} className="w-4 h-4 mr-1" />
            Back to Service Details
          </Link>
        </div>

        {renderServiceSummary()}

        <div className={`rounded-lg shadow-lg p-6 ${isDarkMode ? 'bg-dark-800 border border-dark-700' : 'bg-white'}`}>
          <h1 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Book This Service</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                    placeholder="Enter your email address"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                    placeholder="Enter your phone number"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('gender')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            <div>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Passenger Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Adults <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register('passengers.adults', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Children
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('passengers.children', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                  />
                </div>
              </div>
              {errors.passengers && <p className="mt-1 text-sm text-red-600">Please specify valid passenger counts</p>}
            </div>

            {/* Service-specific fields */}
            {service.category === 'tours' && (
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Tour Details</h3>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Departure Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('departureDate')}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                  />
                  {errors.departureDate && <p className="mt-1 text-sm text-red-600">{errors.departureDate.message}</p>}
                </div>
              </div>
            )}

            {service.category === 'car-rental' && (
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Trip Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      From <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('from')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                      placeholder="Departure location"
                    />
                    {errors.from && <p className="mt-1 text-sm text-red-600">{errors.from.message}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      To <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register('to')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                      placeholder="Destination"
                    />
                    {errors.to && <p className="mt-1 text-sm text-red-600">{errors.to.message}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      {...register('returnTrip')}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Return Trip</span>
                  </label>
                </div>

                {watchReturnTrip && (
                  <div className="mt-4">
                    <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Return Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      {...register('returnDate')}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                    />
                    {errors.returnDate && <p className="mt-1 text-sm text-red-600">{errors.returnDate.message}</p>}
                  </div>
                )}

                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Trip Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('tripDetails')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                    placeholder="Describe your trip requirements..."
                  />
                  {errors.tripDetails && <p className="mt-1 text-sm text-red-600">{errors.tripDetails.message}</p>}
                </div>
              </div>
            )}

            {!['tours', 'car-rental'].includes(service.category) && (
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Service Requirements</h3>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Request Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('requestDetails')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-700 dark:text-white"
                    placeholder="Please describe your service requirements in detail..."
                  />
                  {errors.requestDetails && <p className="mt-1 text-sm text-red-600">{errors.requestDetails.message}</p>}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t border-gray-200 dark:border-dark-600">
              <button
                type="submit"
                disabled={createBookingMutation.isPending}
                className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createBookingMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <Icon icon={Icons.FiLoader} className="animate-spin h-5 w-5 mr-2" />
                    Submitting Request...
                  </div>
                ) : (
                  'Submit Booking Request'
                )}
              </button>
              <p className={`mt-2 text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                We will contact you within 24 hours to confirm your booking and provide payment instructions.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceBooking;
