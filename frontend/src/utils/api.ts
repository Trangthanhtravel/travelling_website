import axios, { AxiosResponse } from 'axios';
import {
    User,
    Tour,
    Booking,
    TourFilters,
    ApiResponse,
    PaginationResponse, Service
} from '../types';

// Create axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Create admin axios instance
const adminAPI = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for admin API to add auth token
adminAPI.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for admin API to handle errors
adminAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

// Auth API (Admin only)
export const authAPI = {
    adminLogin: (email: string, password: string): Promise<AxiosResponse<ApiResponse<{ user: User; token: string }>>> =>
        adminAPI.post('/auth/admin/login', { email, password }),
};

// Tours API (Public)
export const toursAPI = {
    // Get all tours with filters and language support
    getTours: async (filters?: TourFilters & { language?: string }): Promise<ApiResponse<PaginationResponse<Tour>>> => {
        const params = new URLSearchParams();

        if (filters) {
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());
            if (filters.search) params.append('search', filters.search);
            if (filters.category) params.append('category', filters.category);
            if (filters.location) params.append('location', filters.location);
            if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
            if (filters.sortBy) params.append('sortBy', filters.sortBy);
            if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
            if (filters.status) params.append('status', filters.status);
            if (filters.language) params.append('language', filters.language); // Add language parameter
        }

        const response: AxiosResponse<ApiResponse<PaginationResponse<Tour>>> = await api.get(`/tours?${params}`);
        return response.data;
    },

    // Get featured tours with language support
    getFeaturedTours: async (limit?: number, language?: string): Promise<ApiResponse<Tour[]>> => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (language) params.append('language', language);

        const response: AxiosResponse<ApiResponse<Tour[]>> = await api.get(`/tours/featured?${params}`);
        return response.data;
    },

    // Get tour by ID with language support
    getTour: async (id: string, language?: string): Promise<ApiResponse<Tour>> => {
        const params = new URLSearchParams();
        if (language) params.append('language', language);

        const response: AxiosResponse<ApiResponse<Tour>> = await api.get(`/tours/${id}?${params}`);
        return response.data;
    },

    // Get tour by slug with language support
    getTourBySlug: async (slug: string, language?: string): Promise<ApiResponse<Tour>> => {
        const params = new URLSearchParams();
        if (language) params.append('language', language);

        const response: AxiosResponse<ApiResponse<Tour>> = await api.get(`/tours/${slug}?${params}`);
        return response.data;
    },

    // Check tour availability
    checkAvailability: async (tourId: string, date: string, participants: number): Promise<ApiResponse<any>> => {
        const response: AxiosResponse<ApiResponse<any>> = await api.get(`/tours/${tourId}/availability`, {
            params: { date, participants }
        });
        return response.data;
    },
};

// Services API (Public)
export const servicesAPI = {
    // Get all services with language support
    getServices: async (filters?: { category?: string; search?: string; language?: string }): Promise<ApiResponse<Service[]>> => {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.language) params.append('language', filters.language);

        const response: AxiosResponse<ApiResponse<Service[]>> = await api.get(`/services?${params}`);
        return response.data;
    },

    // Get service by ID with language support
    getServiceById: async (id: string, language?: string): Promise<ApiResponse<Service>> => {
        const params = new URLSearchParams();
        if (language) params.append('language', language);

        const response: AxiosResponse<ApiResponse<Service>> = await api.get(`/services/${id}?${params}`);
        return response.data;
    },

    // Get service by slug with language support
    getServiceBySlug: async (slug: string, language?: string): Promise<ApiResponse<Service>> => {
        const params = new URLSearchParams();
        if (language) params.append('language', language);

        const response: AxiosResponse<ApiResponse<Service>> = await api.get(`/services/${slug}?${params}`);
        return response.data;
    },
};

// Categories API with language support
export const categoriesAPI = {
    // Get categories with language support
    getCategories: async (type?: string, language?: string): Promise<ApiResponse<any[]>> => {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (language) params.append('language', language);

        const response: AxiosResponse<ApiResponse<any[]>> = await api.get(`/categories?${params}`);
        return response.data;
    },
};

// Bookings API
export const bookingsAPI = {
    // Public - Direct booking without authentication (updated to handle both tours and services)
    createDirectBooking: (bookingData: {
        // Tour fields
        tourId?: number;
        tourSlug?: string;
        tourTitle?: string;
        // Service fields
        serviceId?: number;
        serviceSlug?: string;
        serviceTitle?: string;
        // Common fields
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
        // Personal information
        gender?: string;
        dateOfBirth?: string;
        address?: string;
        // Emergency contact (tours)
        emergencyContactName?: string;
        emergencyContactPhone?: string;
        emergencyContactRelationship?: string;
        // Service-specific fields
        departureLocation?: string;
        destinationLocation?: string;
        returnTrip?: boolean;
        returnDate?: string;
    }): Promise<AxiosResponse<ApiResponse<{ bookingNumber: string; bookingId: number; status: string; itemTitle: string; type: string }>>> =>
        api.post('/bookings', bookingData),

    // Admin only
    getAllBookings: (): Promise<AxiosResponse<ApiResponse<Booking[]>>> =>
        adminAPI.get('/bookings'),

    updateBookingStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponse<void>>> =>
        adminAPI.put(`/bookings/${id}/status`, { status }),

    getBookingById: (id: string): Promise<AxiosResponse<ApiResponse<Booking>>> =>
        adminAPI.get(`/bookings/${id}`),

    addBookingNote: (id: string, content: string): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.post(`/bookings/${id}/notes`, { content }),

    getBookingStats: (): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.get('/bookings/stats'),
};

// Blog API (replacing content API with proper blog endpoints)
export const blogAPI = {
    getBlogs: (filters: any = {}): Promise<AxiosResponse<any>> => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== undefined && filters[key] !== null) {
                params.append(key, filters[key].toString());
            }
        });
        return api.get(`/blogs?${params.toString()}`);
    },

    getBlogBySlug: (slug: string): Promise<AxiosResponse<any>> =>
        api.get(`/blogs/slug/${slug}`),

    // Admin only
    getBlogById: (id: string): Promise<AxiosResponse<any>> =>
        adminAPI.get(`/blogs/admin/${id}`),

    createBlog: (blogData: any): Promise<AxiosResponse<any>> =>
        adminAPI.post('/blogs/admin', blogData),

    updateBlog: (id: string, blogData: any): Promise<AxiosResponse<any>> =>
        adminAPI.put(`/blogs/admin/${id}`, blogData),

    deleteBlog: (id: string): Promise<AxiosResponse<any>> =>
        adminAPI.delete(`/blogs/admin/${id}`),

    updateBlogStatus: (id: string, status: string): Promise<AxiosResponse<any>> =>
        adminAPI.patch(`/blogs/admin/${id}/status`, { status }),
};

// Content API (Public) - keeping for backward compatibility but updating to use blog API
export const contentAPI = {
    getBlogs: (): Promise<AxiosResponse<any>> =>
        blogAPI.getBlogs(),

    getBlogBySlug: (slug: string): Promise<AxiosResponse<any>> =>
        blogAPI.getBlogBySlug(slug),

    // Admin only
    createBlog: (blogData: any): Promise<AxiosResponse<any>> =>
        blogAPI.createBlog(blogData),

    updateBlog: (id: string, blogData: any): Promise<AxiosResponse<any>> =>
        blogAPI.updateBlog(id, blogData),

    deleteBlog: (id: string): Promise<AxiosResponse<any>> =>
        blogAPI.deleteBlog(id),
};

// Social Links API
export const socialLinksAPI = {
    // Public
    getPublicSocialLinks: (): Promise<AxiosResponse<ApiResponse<any[]>>> =>
        api.get('/social-links/public'),

    // Admin only
    getAllSocialLinks: (): Promise<AxiosResponse<ApiResponse<any[]>>> =>
        adminAPI.get('/social-links'),

    createSocialLink: (linkData: any): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.post('/social-links', linkData),

    updateSocialLink: (id: string, linkData: any): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.put(`/social-links/${id}`, linkData),

    deleteSocialLink: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
        adminAPI.delete(`/social-links/${id}`),
};

// Email Settings API
export const emailSettingsAPI = {
    getEmailSettings: (): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.get('/email-settings'),

    updateEmailSettings: (settings: any): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.put('/email-settings', settings),

    testEmailConfiguration: (testData: any): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.post('/email-settings/test', testData),

    getEmailStats: (): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.get('/email-settings/stats'),
};

// Admin API
export const adminAPI_functions = {
    getDashboardStats: (): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.get('/admin/stats'),

        getProfile: (): Promise<AxiosResponse<ApiResponse<User>>> =>
            adminAPI.get('/admin/profile'),
    };


export default api;