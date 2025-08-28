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
    getTours: (filters?: TourFilters): Promise<AxiosResponse<PaginationResponse<Tour>>> =>
        api.get('/tours', { params: filters }),

    getFeaturedTours: (): Promise<AxiosResponse<ApiResponse<Tour[]>>> =>
        api.get('/tours/featured'),

    getTourBySlug: (slug: string): Promise<AxiosResponse<ApiResponse<Tour>>> =>
        api.get(`/tours/${slug}`),

    checkAvailability: (tourId: string, date: string, participants: number): Promise<AxiosResponse<ApiResponse<any>>> =>
        api.get(`/tours/${tourId}/availability`, { params: { date, participants } }),

    // Admin only
    createTour: (tourData: FormData): Promise<AxiosResponse<ApiResponse<Tour>>> =>
        adminAPI.post('/tours', tourData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    updateTour: (id: string, tourData: Partial<Tour>): Promise<AxiosResponse<ApiResponse<Tour>>> =>
        adminAPI.put(`/tours/${id}`, tourData),

    deleteTour: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
        adminAPI.delete(`/tours/${id}`),
};

// Services API (Public)
export const servicesAPI = {
    getServices: (): Promise<AxiosResponse<ApiResponse<any[]>>> =>
        api.get('/services'),

    getServiceById: (id: string): Promise<AxiosResponse<ApiResponse<Service>>> =>
        api.get(`/services/${id}`),

    getServiceBySlug: (slug: string): Promise<AxiosResponse<ApiResponse<Service>>> =>
        api.get(`/services/${slug}`),
};

// Bookings API
export const bookingsAPI = {
    // Public - Direct booking without authentication
    createDirectBooking: (bookingData: {
        type: 'tour' | 'service';
        itemId: string;
        customerInfo: {
            name: string;
            email: string;
            phone: string;
        };
        bookingDetails: {
            startDate: string;
            totalTravelers: number;
            specialRequests?: string;
        };
        pricing: {
            totalAmount: number;
            currency: string;
        };
    }): Promise<AxiosResponse<ApiResponse<{ bookingNumber: string }>>> =>
        api.post('/bookings', bookingData),

    // Admin only
    getAllBookings: (): Promise<AxiosResponse<ApiResponse<Booking[]>>> =>
        adminAPI.get('/bookings'),

    updateBookingStatus: (id: string, status: string): Promise<AxiosResponse<ApiResponse<void>>> =>
        adminAPI.put(`/bookings/${id}/status`, { status }),
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