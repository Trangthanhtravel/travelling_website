// Mock data for bookings to support booking functionality

export interface MockBooking {
  id: number;
  type: 'tour' | 'service';
  item_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  start_date: string;
  total_travelers: number;
  special_requests?: string;
  total_amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'contacted' | 'completed' | 'cancelled';
  contacted_at?: string;
  confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export const mockBookings: MockBooking[] = [
  {
    id: 1,
    type: 'tour',
    item_id: 1,
    customer_name: 'John Smith',
    customer_email: 'john.smith@email.com',
    customer_phone: '+1-555-0123',
    start_date: '2024-03-15',
    total_travelers: 2,
    special_requests: 'Vegetarian meals preferred',
    total_amount: 598,
    currency: 'USD',
    status: 'confirmed',
    contacted_at: '2024-01-20T10:00:00Z',
    confirmed_at: '2024-01-20T14:30:00Z',
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T14:30:00Z'
  },
  {
    id: 2,
    type: 'service',
    item_id: 1,
    customer_name: 'Maria Garcia',
    customer_email: 'maria.garcia@email.com',
    customer_phone: '+1-555-0456',
    start_date: '2024-02-28',
    total_travelers: 1,
    special_requests: 'Airport pickup at Terminal 2',
    total_amount: 25,
    currency: 'USD',
    status: 'pending',
    created_at: '2024-01-25T15:30:00Z',
    updated_at: '2024-01-25T15:30:00Z'
  },
  {
    id: 3,
    type: 'tour',
    item_id: 2,
    customer_name: 'David Wilson',
    customer_email: 'david.wilson@email.com',
    customer_phone: '+1-555-0789',
    start_date: '2024-04-10',
    total_travelers: 4,
    special_requests: 'Family with 2 children (ages 8 and 12)',
    total_amount: 796,
    currency: 'USD',
    status: 'contacted',
    contacted_at: '2024-01-28T11:00:00Z',
    created_at: '2024-01-28T10:15:00Z',
    updated_at: '2024-01-28T11:00:00Z'
  }
];

// Helper functions for booking
export const calculateTotalAmount = (basePrice: number, travelers: number): number => {
  return basePrice * travelers;
};

// Mock API functions for bookings
export const createBooking = async (bookingData: Omit<MockBooking, 'id' | 'created_at' | 'updated_at'>): Promise<MockBooking> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newBooking: MockBooking = {
    ...bookingData,
    id: mockBookings.length + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  mockBookings.push(newBooking);
  return newBooking;
};

export const getBookingById = async (id: number): Promise<MockBooking | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockBookings.find(booking => booking.id === id) || null;
};
