import axios, { AxiosResponse } from 'axios';
import {
    User,
    Tour,
    Booking,
    Content,
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


// Content API (Public)
export const contentAPI = {
    getBlogs: (): Promise<AxiosResponse<ApiResponse<Content[]>>> =>
        api.get('/content/blogs'),

    getBlogBySlug: (slug: string): Promise<AxiosResponse<ApiResponse<Content>>> =>
        api.get(`/content/blogs/${slug}`),

    // Admin only
    createBlog: (blogData: any): Promise<AxiosResponse<ApiResponse<Content>>> =>
        adminAPI.post('/content/blogs', blogData),

    updateBlog: (id: string, blogData: any): Promise<AxiosResponse<ApiResponse<Content>>> =>
        adminAPI.put(`/content/blogs/${id}`, blogData),

    deleteBlog: (id: string): Promise<AxiosResponse<ApiResponse<void>>> =>
        adminAPI.delete(`/content/blogs/${id}`),
};

// Admin API
export const adminAPI_functions = {
    getDashboardStats: (): Promise<AxiosResponse<ApiResponse<any>>> =>
        adminAPI.get('/admin/stats'),

    getProfile: (): Promise<AxiosResponse<ApiResponse<User>>> =>
        adminAPI.get('/admin/profile'),
};

export default api;