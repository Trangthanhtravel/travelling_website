// API utility functions with mock data integration
import { mockTours } from '../data/mockTours';
import { mockServices } from '../data/mockServices';
import { mockBlogs, Blog } from '../data/mockBlogs';
import { 
  mockBookings, 
  createBooking, 
  getBookingById, 
  MockBooking 
} from '../data/mockBookings';
import { Tour, Service, TourFilters, ApiResponse, PaginationResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Simulate API delay for realistic experience
const simulateDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Tours API
export const toursApi = {
  // Get all tours with filters
  async getAll(filters: TourFilters = {}): Promise<PaginationResponse<Tour>> {
    await simulateDelay();
    
    let filteredTours = [...mockTours];
    
    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTours = filteredTours.filter(tour => 
        tour.title.toLowerCase().includes(searchLower) ||
        tour.description.toLowerCase().includes(searchLower) ||
        tour.location.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.category) {
      filteredTours = filteredTours.filter(tour => tour.category === filters.category);
    }
    
    if (filters.location) {
      filteredTours = filteredTours.filter(tour => 
        tour.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    
    if (filters.minPrice) {
      filteredTours = filteredTours.filter(tour => tour.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice) {
      filteredTours = filteredTours.filter(tour => tour.price <= filters.maxPrice!);
    }
    
    // Apply sorting
    if (filters.sortBy) {
      filteredTours.sort((a, b) => {
        const order = filters.sortOrder === 'desc' ? -1 : 1;
        switch (filters.sortBy) {
          case 'price':
            return (a.price - b.price) * order;
          case 'title':
            return a.title.localeCompare(b.title) * order;
          case 'created_at':
            return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * order;
          default:
            return 0;
        }
      });
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTours = filteredTours.slice(startIndex, endIndex);
    
    return {
      success: true,
      data: paginatedTours,
      pagination: {
        total: filteredTours.length,
        currentPage: page,
        totalPages: Math.ceil(filteredTours.length / limit),
        hasNext: endIndex < filteredTours.length,
        hasPrev: page > 1,
        limit
      }
    };
  },

  // Get tour by ID
  async getById(id: number): Promise<ApiResponse<Tour>> {
    await simulateDelay();
    const tour = mockTours.find(t => t.id === id);
    if (!tour) {
      throw new Error('Tour not found');
    }
    return { success: true, data: tour };
  },

  // Get tour by slug
  async getBySlug(slug: string): Promise<ApiResponse<Tour>> {
    await simulateDelay();
    const tour = mockTours.find(t => t.slug === slug);
    if (!tour) {
      throw new Error('Tour not found');
    }
    return { success: true, data: tour };
  },

  // Get featured tours
  async getFeatured(): Promise<ApiResponse<Tour[]>> {
    await simulateDelay();
    const featuredTours = mockTours.filter(tour => tour.featured);
    return { success: true, data: featuredTours };
  }
};

// Services API
export const servicesApi = {
  // Get all services
  async getAll(): Promise<ApiResponse<Service[]>> {
    await simulateDelay();
    return { success: true, data: mockServices };
  },

  // Get service by ID
  async getById(id: string): Promise<ApiResponse<Service>> {
    await simulateDelay();
    const service = mockServices.find(s => s.id === id);
    if (!service) {
      throw new Error('Service not found');
    }
    return { success: true, data: service };
  },

  // Get services by category
  async getByCategory(category: string): Promise<ApiResponse<Service[]>> {
    await simulateDelay();
    const categoryServices = mockServices.filter(service => service.category === category);
    return { success: true, data: categoryServices };
  },

  // Get featured services
  async getFeatured(): Promise<ApiResponse<Service[]>> {
    await simulateDelay();
    const featuredServices = mockServices.filter(service => service.featured);
    return { success: true, data: featuredServices };
  }
};

// Blogs API
export const blogsApi = {
  // Get all blogs
  async getAll(): Promise<ApiResponse<Blog[]>> {
    await simulateDelay();
    const publishedBlogs = mockBlogs.filter(blog => blog.status === 'published');
    return { success: true, data: publishedBlogs };
  },

  // Get blog by slug
  async getBySlug(slug: string): Promise<ApiResponse<Blog>> {
    await simulateDelay();
    const blog = mockBlogs.find(b => b.slug === slug && b.status === 'published');
    if (!blog) {
      throw new Error('Blog not found');
    }
    return { success: true, data: blog };
  },

  // Get featured blogs
  async getFeatured(): Promise<ApiResponse<Blog[]>> {
    await simulateDelay();
    const featuredBlogs = mockBlogs.filter(blog => blog.featured && blog.status === 'published');
    return { success: true, data: featuredBlogs };
  }
};

// Bookings API
export const bookingsApi = {
  // Create a new booking
  async create(bookingData: any): Promise<ApiResponse<MockBooking>> {
    const booking = await createBooking(bookingData);
    return { success: true, data: booking };
  },

  // Get booking by ID
  async getById(id: number): Promise<ApiResponse<MockBooking | null>> {
    const booking = await getBookingById(id);
    return { success: true, data: booking };
  },

  // Get all bookings (admin only)
  async getAll(): Promise<ApiResponse<MockBooking[]>> {
    await simulateDelay();
    return { success: true, data: mockBookings };
  }
};

// Contact/Support API
export const contactApi = {
  // Send contact form
  async sendMessage(messageData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse<{ message: string }>> {
    await simulateDelay(1000);
    // Simulate sending email
    console.log('Contact form submitted:', messageData);
    return { 
      success: true, 
      data: { message: 'Your message has been sent successfully. We will get back to you soon!' }
    };
  }
};

// Admin API (for admin panel)
export const adminApi = {
  // Dashboard stats
  async getDashboardStats(): Promise<ApiResponse<{
    totalTours: number;
    totalServices: number;
    totalBookings: number;
    pendingBookings: number;
    totalRevenue: number;
    recentBookings: MockBooking[];
  }>> {
    await simulateDelay();
    
    const totalRevenue = mockBookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, booking) => sum + booking.total_amount, 0);
    
    const recentBookings = mockBookings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);
    
    return {
      success: true,
      data: {
        totalTours: mockTours.length,
        totalServices: mockServices.length,
        totalBookings: mockBookings.length,
        pendingBookings: mockBookings.filter(b => b.status === 'pending').length,
        totalRevenue,
        recentBookings
      }
    };
  }
};

// Export default API object
export default {
  tours: toursApi,
  services: servicesApi,
  blogs: blogsApi,
  bookings: bookingsApi,
  contact: contactApi,
  admin: adminApi
};
