// User types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'editor';
  createdAt: string;
  updatedAt: string;
}

// Tour types (matching corrected backend implementation)
export interface Tour {
  id: number; // Changed to number to match DB INTEGER PRIMARY KEY
  title: string;
  slug: string; // Added: missing slug field
  description: string;
  price: number;
  duration: string;
  location: string;
  max_participants: number;
  category: 'domestic' | 'inbound' | 'outbound'; // Updated: only three tour categories
  images: string[];
  itinerary: any;
  included: string[];
  excluded: string[];
  status: 'active' | 'inactive' | 'draft';
  featured: boolean;
  created_at: string;
  updated_at: string;
  // Legacy compatibility fields (for existing frontend code)
  maxParticipants?: number; // alias for max_participants
  image_url?: string; // computed from images[0]
  pricing?: {
    basePrice: number;
  };
}

// Pagination types
export interface Pagination {
  total: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

// Tour filters for API requests
export interface TourFilters {
  page?: number;
  limit?: number;
  search?: string;
  location?: string;
  category?: string;
  duration?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Booking types (simplified)
export interface Booking {
  id: string;
  tourId: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  bookingDate: string;
  travelDate: string;
  participants: number;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  id: string;
  tourId: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

// Content types (for blogs, etc.)
export interface Content {
  id: string;
  title: string;
  slug: string;
  content: string;
  type: 'blog' | 'page';
  status: 'published' | 'draft';
  authorId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Service types (matching backend Service model)
export interface Service {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  price: number;
  duration?: string;
  category: 'tours' | 'car-rental' | 'hotel-booking' | 'train-booking' | 'cruise' | 'visa-service';
  service_type?: string;
  images: string[];
  videos?: string[];
  included: string[];
  excluded: string[];
  itinerary?: string[];
  location?: any;
  featured: boolean;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

// Service booking form types
export interface ServiceBookingForm {
  serviceId: string;
  serviceType: string;
  name: string;
  email: string;
  gender: string;
  dateOfBirth?: string;
  phone: string;
  address?: string;
  passengers: {
    adults: number;
    children: number;
  };
  departureDate?: string;
  from?: string;
  to?: string;
  returnTrip?: boolean;
  returnDate?: string;
  tripDetails?: string;
  requestDetails?: string;
}

// Update API Response types to match backend structure
export interface ServiceApiResponse {
  success: boolean;
  data: {
    service: Service;
  };
  message?: string;
}
