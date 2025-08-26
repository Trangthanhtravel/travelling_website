import { Service } from '../types';

export const mockServices: Service[] = [
  {
    id: '1',
    title: 'Airport Transfer Service',
    subtitle: 'Comfortable and reliable transportation',
    description: 'Professional airport transfer service with modern vehicles and experienced drivers. Available 24/7 for arrivals and departures at all major airports in Vietnam.',
    price: 25,
    duration: '1-2 hours',
    category: 'car-rental',
    service_type: 'car-rental',
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'
    ],
    included: [
      'Professional driver',
      'Fuel and tolls included',
      'Meet & greet service',
      'Flight monitoring',
      'Free waiting time (60 minutes)',
      'Child seats available'
    ],
    excluded: [
      'Tips for driver',
      'Additional stops',
      'Excess waiting time charges',
      'Highway tolls for long distance'
    ],
    featured: true,
    status: 'active',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    title: 'City Car Rental - Economy',
    subtitle: 'Affordable daily car rental',
    description: 'Rent an economy car for exploring the city at your own pace. Perfect for couples or small families. All vehicles are well-maintained and include basic insurance.',
    price: 35,
    duration: '24 hours',
    category: 'car-rental',
    service_type: 'car-rental',
    images: [
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    included: [
      '24-hour rental period',
      'Basic insurance coverage',
      'Unlimited mileage within city',
      'GPS navigation system',
      'Emergency roadside assistance',
      'Full tank of fuel'
    ],
    excluded: [
      'Additional driver fee',
      'Fuel refill cost',
      'Parking fees',
      'Traffic fines',
      'Cross-border travel'
    ],
    featured: false,
    status: 'active',
    created_at: '2024-01-16T08:00:00Z',
    updated_at: '2024-01-16T08:00:00Z'
  },
  {
    id: '3',
    title: 'Luxury SUV with Driver',
    subtitle: 'Premium transportation experience',
    description: 'Travel in style with our luxury SUV and professional chauffeur service. Perfect for business trips, special occasions, or comfortable family travel.',
    price: 80,
    duration: '8 hours',
    category: 'car-rental',
    service_type: 'car-rental',
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop'
    ],
    included: [
      'Professional chauffeur',
      'Luxury SUV (7-seater)',
      'Complimentary water and snacks',
      'WiFi connectivity',
      'Phone chargers',
      'Flexible itinerary'
    ],
    excluded: [
      'Meals for driver',
      'Overnight accommodation for driver',
      'Entrance fees to attractions',
      'Personal expenses'
    ],
    featured: true,
    status: 'active',
    created_at: '2024-01-17T08:00:00Z',
    updated_at: '2024-01-17T08:00:00Z'
  },
  {
    id: '4',
    title: 'Train Ticket Booking Service',
    subtitle: 'Hassle-free train reservations',
    description: 'Let us handle your train ticket bookings for domestic and international routes. We ensure you get the best seats and prices for your journey.',
    price: 15,
    duration: '1 day processing',
    category: 'train-booking',
    service_type: 'other-services',
    images: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&h=600&fit=crop'
    ],
    included: [
      'Ticket booking service',
      'Seat selection assistance',
      'Email confirmation',
      'Booking modification (if allowed)',
      'Customer support',
      'Delivery to hotel (in city)'
    ],
    excluded: [
      'Train ticket cost',
      'Delivery outside city limits',
      'Cancellation fees',
      'Meal expenses on train'
    ],
    featured: false,
    status: 'active',
    created_at: '2024-01-18T08:00:00Z',
    updated_at: '2024-01-18T08:00:00Z'
  },
  {
    id: '5',
    title: 'Hotel Booking Assistant',
    subtitle: 'Find and book perfect accommodations',
    description: 'Our hotel booking service helps you find the best accommodations that match your budget and preferences. We have partnerships with hotels worldwide.',
    price: 20,
    duration: '2-4 hours',
    category: 'hotel-booking',
    service_type: 'other-services',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'
    ],
    included: [
      'Hotel research and recommendations',
      'Price comparison',
      'Booking confirmation',
      'Special requests handling',
      'Cancellation assistance',
      '24/7 support during stay'
    ],
    excluded: [
      'Hotel accommodation cost',
      'Booking modification fees',
      'Meals at hotel',
      'Additional services at hotel'
    ],
    featured: false,
    status: 'active',
    created_at: '2024-01-19T08:00:00Z',
    updated_at: '2024-01-19T08:00:00Z'
  },
  {
    id: '6',
    title: 'Visa Application Service',
    subtitle: 'Simplified visa processing',
    description: 'Complete visa application assistance for all countries. We handle documentation, appointment booking, and follow-up to ensure smooth processing.',
    price: 50,
    duration: '5-15 business days',
    category: 'visa-service',
    service_type: 'other-services',
    images: [
      'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=600&fit=crop'
    ],
    included: [
      'Document checklist and guidance',
      'Application form assistance',
      'Appointment booking',
      'Document review',
      'Status tracking',
      'Pickup and delivery service'
    ],
    excluded: [
      'Embassy/consulate fees',
      'Translation costs',
      'Rush processing fees',
      'Travel to embassy (if required)',
      'Rejected application fees'
    ],
    featured: true,
    status: 'active',
    created_at: '2024-01-20T08:00:00Z',
    updated_at: '2024-01-20T08:00:00Z'
  },
  {
    id: '7',
    title: 'Private City Tour Guide',
    subtitle: 'Personalized city exploration',
    description: 'Explore the city with a knowledgeable local guide who will customize the tour based on your interests. Available in multiple languages.',
    price: 60,
    duration: '6-8 hours',
    category: 'tours',
    service_type: 'tours',
    images: [
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d3b86f?w=800&h=600&fit=crop'
    ],
    included: [
      'Professional local guide',
      'Customized itinerary',
      'Transportation coordination',
      'Restaurant recommendations',
      'Photography assistance',
      'Multiple language options'
    ],
    excluded: [
      'Transportation costs',
      'Entrance fees to attractions',
      'Meals and refreshments',
      'Personal shopping expenses',
      'Tips for guide'
    ],
    featured: true,
    status: 'active',
    created_at: '2024-01-21T08:00:00Z',
    updated_at: '2024-01-21T08:00:00Z'
  },
  {
    id: '8',
    title: 'Cruise Booking Service',
    subtitle: 'Unforgettable cruise experiences',
    description: 'Book amazing cruise packages with our expert assistance. From luxury liners to adventure cruises, we help you find the perfect maritime vacation.',
    price: 75,
    duration: '1-2 days processing',
    category: 'cruise',
    service_type: 'other-services',
    images: [
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    included: [
      'Cruise research and recommendations',
      'Cabin selection assistance',
      'Booking confirmation',
      'Pre-cruise planning',
      'Shore excursion recommendations',
      'Travel insurance options'
    ],
    excluded: [
      'Cruise fare',
      'Shore excursion costs',
      'Specialty dining on cruise',
      'Beverage packages',
      'Gratuities on cruise'
    ],
    featured: false,
    status: 'active',
    created_at: '2024-01-22T08:00:00Z',
    updated_at: '2024-01-22T08:00:00Z'
  }
];

// Export filtered services for easy access
export const featuredServices = mockServices.filter(service => service.featured);
export const carRentalServices = mockServices.filter(service => service.category === 'car-rental');
export const tourServices = mockServices.filter(service => service.category === 'tours');
export const otherServices = mockServices.filter(service => service.service_type === 'other-services');
