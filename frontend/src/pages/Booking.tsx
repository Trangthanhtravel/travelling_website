import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toursAPI, bookingsAPI } from '../utils/api';
import { BookingForm } from '../types';
import { Icon, Icons } from '../components/common/Icons';
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
      toast.success('Booking request submitted successfully! We will contact you soon.');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit booking');
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
    if (!tourData || !pricing) return;

    const bookingData = {
      type: 'tour' as const,
      itemId: slug!, // Use slug instead of trying to get ID from tour data
      customerInfo: data.customerInfo,
      bookingDetails: {
        startDate: data.startDate,
        totalTravelers: data.totalTravelers,
        specialRequests: data.specialRequests || undefined,
      },
      pricing: {
        totalAmount: pricing.totalAmount,
        currency: pricing.currency,
      },
    };

    createBookingMutation.mutate(bookingData);
  };

  if (tourLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon icon={Icons.FiLoader} className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (!tourData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Tour not found</h2>
          <p className="mt-2 text-gray-600">The tour you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Debug: Log the actual structure of tourData
  console.log('Tour Data Structure:', tourData);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Tour Summary */}
          <div className="bg-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">{tourData?.title || 'Tour Title'}</h1>
            <p className="mt-2 opacity-90">
              {tourData?.duration?.days && tourData?.duration?.nights ?
                `${tourData.duration.days} days / ${tourData.duration.nights} nights` :
                'Duration TBD'
              } • {tourData?.location?.city && tourData?.location?.country ?
                `${tourData.location.city}, ${tourData.location.country}` :
                tourData?.destination || 'Location TBD'
              }
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-lg">Price per person:</span>
              <span className="text-2xl font-bold">
                ${tourData?.pricing?.basePrice || tourData?.price || 0}
              </span>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
            {/* Customer Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    {...register('customerInfo.name')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your full name"
                  />
                  {errors.customerInfo?.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerInfo.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    {...register('customerInfo.email')}
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your email"
                  />
                  {errors.customerInfo?.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerInfo.email.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    {...register('customerInfo.phone')}
                    type="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Enter your phone number"
                  />
                  {errors.customerInfo?.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.customerInfo.phone.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    {...register('startDate')}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Travelers *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500">Adults</label>
                      <input
                        {...register('numberOfTravelers.adults', { valueAsNumber: true })}
                        type="number"
                        min="1"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Children</label>
                      <input
                        {...register('numberOfTravelers.children', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Infants</label>
                      <input
                        {...register('numberOfTravelers.infants', { valueAsNumber: true })}
                        type="number"
                        min="0"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {errors.numberOfTravelers && (
                    <p className="mt-1 text-sm text-red-600">Please specify valid traveler counts</p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Total: {watchedValues.totalTravelers || 1} travelers
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Special Requests
                  </label>
                  <textarea
                    {...register('specialRequests')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Any special requirements or requests..."
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact (Optional) */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact (Optional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    {...register('emergencyContact.name')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Emergency contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    {...register('emergencyContact.phone')}
                    type="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Emergency contact phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Relationship</label>
                  <input
                    {...register('emergencyContact.relationship')}
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Relationship to traveler"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Summary */}
            {pricing && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Price per person:</span>
                    <span>${pricing.basePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total travelers:</span>
                    <span>{pricing.totalTravelers}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount:</span>
                    <span>${pricing.totalAmount}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={isSubmitting || !pricing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Icon icon={Icons.FiLoader} className="animate-spin h-5 w-5 mr-2" />
                    Submitting Request...
                  </div>
                ) : (
                  'Submit Booking Request'
                )}
              </button>
              <p className="mt-2 text-sm text-gray-600 text-center">
                We will contact you within 24 hours to confirm your booking and provide payment instructions.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DirectBooking;
