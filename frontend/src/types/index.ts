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
  image: string | null; // Changed from images array to single image
  gallery: string[]; // Keep gallery as array for multiple gallery images
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
    status?: 'active' | 'inactive' | 'draft';
    featured?: string;
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

// Booking types (updated to match frontend-backend alignment)
export interface Booking {
  id: number;
  type: 'tour' | 'service';
  item_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  total_travelers: number;
  adults?: number;
  children?: number;
  infants?: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  special_requests?: string;
  total_amount: number;
  currency: string;
  booking_number?: string;
  status: 'pending' | 'confirmed' | 'contacted' | 'completed' | 'cancelled';
  contacted_at?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingForm {
  tourId: number;
  startDate: string;
  numberOfTravelers: {
    adults: number;
    children: number;
    infants: number;
  };
  specialRequests?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Direct booking form structure that matches what frontend sends to backend
export interface DirectBookingRequest {
  tourId: number;
  tourSlug?: string;
  tourTitle?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  adults: number;
  children: number;
  infants: number;
  totalTravelers: number;
  totalAmount: number;
  currency?: string;
  specialRequests?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
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
  slug: string;
  subtitle?: string;
  description: string;
  price: number;
  duration?: string;
  category: 'tours' | 'car-rental' | 'hotel-booking' | 'train-booking' | 'cruise' | 'visa-service';
  service_type?: string;
  image: string | null; // Changed from images array to single image
  gallery: string[]; // Keep gallery as array for multiple gallery images
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

export interface BlogFilters {
    category?: string;
    tag?: string;
    status?: 'draft' | 'published' | 'archived';
    author?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: 'created_at' | 'published_at' | 'views' | 'title';
    sortOrder?: 'asc' | 'desc';
}