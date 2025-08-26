import { Tour } from '../types';

export const mockTours: Tour[] = [
  {
    id: 1,
    title: 'Ha Long Bay Discovery Cruise',
    slug: 'ha-long-bay-discovery-cruise',
    description: 'Experience the breathtaking beauty of Ha Long Bay with limestone karsts, emerald waters, and overnight cruise. Visit Sung Sot Cave, Ti Top Island, and enjoy traditional Vietnamese cuisine while sailing through this UNESCO World Heritage Site.',
    price: 299,
    duration: '3 days 2 nights',
    location: 'Ha Long Bay, Quang Ninh Province',
    max_participants: 16,
    category: 'domestic',
    images: [
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    itinerary: {
      day1: {
        title: 'Hanoi to Ha Long Bay',
        activities: ['Pick up from hotel in Hanoi', 'Transfer to Ha Long Bay (3.5 hours)', 'Check-in cruise', 'Welcome lunch', 'Sung Sot Cave exploration', 'Evening dinner on board']
      },
      day2: {
        title: 'Full Day Cruise',
        activities: ['Tai Chi session at sunrise', 'Ti Top Island visit', 'Swimming and beach time', 'Kayaking through limestone karsts', 'Cooking class', 'Sunset party']
      },
      day3: {
        title: 'Return to Hanoi',
        activities: ['Early morning cruise', 'Brunch on board', 'Check out', 'Transfer back to Hanoi', 'Drop off at hotel']
      }
    },
    included: [
      'Round-trip transportation from Hanoi',
      '2 nights accommodation on cruise',
      'All meals as mentioned in itinerary',
      'English-speaking tour guide',
      'Entrance fees to attractions',
      'Kayaking equipment',
      'Cooking class',
      'Welcome drink'
    ],
    excluded: [
      'Personal expenses',
      'Travel insurance',
      'Tips for guide and driver',
      'Alcoholic beverages',
      'Spa services on cruise'
    ],
    status: 'active',
    featured: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    maxParticipants: 16,
    image_url: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop',
    pricing: { basePrice: 299 }
  },
  {
    id: 2,
    title: 'Sapa Trekking and Cultural Experience',
    slug: 'sapa-trekking-cultural-experience',
    description: 'Trek through stunning rice terraces and experience authentic culture of ethnic minorities including Hmong and Red Dao people. Stay in traditional homestay and enjoy local cuisine.',
    price: 199,
    duration: '3 days 2 nights',
    location: 'Sapa, Lao Cai Province',
    max_participants: 12,
    category: 'domestic',
    images: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1539650116574-75c0c6d3b86f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578409954170-c8cb7bd8c5a7?w=800&h=600&fit=crop'
    ],
    itinerary: {
      day1: {
        title: 'Hanoi to Sapa',
        activities: ['Night train from Hanoi to Lao Cai', 'Transfer to Sapa', 'Check-in homestay', 'Visit local market', 'Short trek to Cat Cat Village']
      },
      day2: {
        title: 'Full Day Trekking',
        activities: ['Breakfast with host family', 'Trek to Lao Chai Village', 'Lunch with locals', 'Continue to Ta Van Village', 'Cultural exchange with Red Dao people', 'Dinner and overnight in homestay']
      },
      day3: {
        title: 'Return to Hanoi',
        activities: ['Morning trek to rice terraces viewpoint', 'Farewell lunch', 'Transfer to Lao Cai station', 'Night train back to Hanoi']
      }
    },
    included: [
      'Round-trip train tickets from Hanoi',
      'All transfers in Sapa',
      '2 nights homestay accommodation',
      'All meals as mentioned',
      'Professional trekking guide',
      'Entrance fees',
      'Cultural activities'
    ],
    excluded: [
      'Personal expenses',
      'Travel insurance',
      'Tips for guide',
      'Drinks during meals',
      'Shopping expenses'
    ],
    status: 'active',
    featured: true,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
    maxParticipants: 12,
    image_url: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
    pricing: { basePrice: 199 }
  },
  {
    id: 3,
    title: 'Mekong Delta Adventure',
    slug: 'mekong-delta-adventure',
    description: 'Explore the vibrant Mekong Delta region, known as the "Rice Bowl" of Vietnam. Visit floating markets, fruit orchards, and traditional villages while cruising through intricate waterways.',
    price: 149,
    duration: '2 days 1 night',
    location: 'Can Tho, Mekong Delta',
    max_participants: 20,
    category: 'domestic',
    images: [
      'https://images.unsplash.com/photo-1583164594617-83c9c9c0e98c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578659077726-eca0ad4ec0a3?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544966503-7cb7a97d1fc1?w=800&h=600&fit=crop'
    ],
    itinerary: {
      day1: {
        title: 'Ho Chi Minh City to Can Tho',
        activities: ['Pick up from hotel in Ho Chi Minh City', 'Drive to Mekong Delta (2.5 hours)', 'Boat trip to local villages', 'Visit fruit gardens', 'Traditional lunch', 'Check-in hotel in Can Tho', 'Evening cruise']
      },
      day2: {
        title: 'Floating Market and Return',
        activities: ['Early morning visit to Cai Rang floating market', 'Breakfast on boat', 'Visit rice paper making village', 'Cycling through countryside', 'Lunch at local restaurant', 'Return to Ho Chi Minh City']
      }
    },
    included: [
      'Round-trip transportation',
      '1 night hotel accommodation',
      'All meals as mentioned',
      'Boat trips',
      'English-speaking guide',
      'Entrance fees',
      'Bicycle rental'
    ],
    excluded: [
      'Personal expenses',
      'Travel insurance',
      'Tips',
      'Alcoholic beverages',
      'Additional activities'
    ],
    status: 'active',
    featured: false,
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
    maxParticipants: 20,
    image_url: 'https://images.unsplash.com/photo-1583164594617-83c9c9c0e98c?w=800&h=600&fit=crop',
    pricing: { basePrice: 149 }
  },
  {
    id: 4,
    title: 'Thailand Adventure Tour',
    slug: 'thailand-adventure-tour',
    description: 'Discover the beauty of Thailand from bustling Bangkok to pristine beaches of Phuket. Experience temples, street food, and tropical paradise in this comprehensive tour.',
    price: 899,
    duration: '7 days 6 nights',
    location: 'Bangkok and Phuket, Thailand',
    max_participants: 15,
    category: 'outbound',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop'
    ],
    itinerary: {
      day1: 'Arrival in Bangkok, hotel check-in, welcome dinner',
      day2: 'Bangkok city tour: Grand Palace, Wat Pho, Chao Phraya River cruise',
      day3: 'Floating market and Ayutthaya day trip',
      day4: 'Flight to Phuket, beach relaxation',
      day5: 'Phi Phi Islands day trip by speedboat',
      day6: 'Phuket island tour, Thai cooking class',
      day7: 'Free time, departure'
    },
    included: [
      'Round-trip international flights',
      '6 nights accommodation (4-star hotels)',
      'Daily breakfast',
      'Airport transfers',
      'All tours and entrance fees',
      'English-speaking guides',
      'Domestic flight Bangkok-Phuket'
    ],
    excluded: [
      'Visa fees',
      'Lunch and dinner (except mentioned)',
      'Personal expenses',
      'Travel insurance',
      'Tips and gratuities'
    ],
    status: 'active',
    featured: true,
    created_at: '2024-01-18T10:00:00Z',
    updated_at: '2024-01-18T10:00:00Z',
    maxParticipants: 15,
    image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    pricing: { basePrice: 899 }
  },
  {
    id: 5,
    title: 'Singapore City Explorer',
    slug: 'singapore-city-explorer',
    description: 'Experience the modern marvels and cultural diversity of Singapore. From Marina Bay Sands to Gardens by the Bay, discover this incredible city-state.',
    price: 599,
    duration: '4 days 3 nights',
    location: 'Singapore',
    max_participants: 18,
    category: 'outbound',
    images: [
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1543829365-8382735b54bc?w=800&h=600&fit=crop'
    ],
    itinerary: {
      day1: 'Arrival, Marina Bay area exploration, light show',
      day2: 'Sentosa Island: Universal Studios',
      day3: 'Cultural tour: Chinatown, Little India, Arab Street',
      day4: 'Gardens by the Bay, shopping, departure'
    },
    included: [
      'Round-trip flights',
      '3 nights hotel accommodation',
      'Daily breakfast',
      'Airport transfers',
      'Universal Studios ticket',
      'City tour with guide'
    ],
    excluded: [
      'Lunch and dinner',
      'Personal expenses',
      'Additional attraction tickets',
      'Shopping expenses',
      'Travel insurance'
    ],
    status: 'active',
    featured: false,
    created_at: '2024-01-19T10:00:00Z',
    updated_at: '2024-01-19T10:00:00Z',
    maxParticipants: 18,
    image_url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop',
    pricing: { basePrice: 599 }
  },
  {
    id: 6,
    title: 'Japan Cultural Journey',
    slug: 'japan-cultural-journey',
    description: 'Immerse yourself in Japanese culture from Tokyo\'s modern skyline to Kyoto\'s ancient temples. Experience traditional ryokan stays and authentic cuisine.',
    price: 1299,
    duration: '8 days 7 nights',
    location: 'Tokyo, Kyoto, Japan',
    max_participants: 12,
    category: 'inbound',
    images: [
      'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=600&fit=crop'
    ],
    itinerary: {
      day1: 'Arrival in Tokyo, hotel check-in',
      day2: 'Tokyo city tour: Senso-ji, Harajuku, Shibuya',
      day3: 'Day trip to Nikko',
      day4: 'Bullet train to Kyoto',
      day5: 'Kyoto temples and traditional districts',
      day6: 'Nara day trip, deer park',
      day7: 'Tea ceremony, sake tasting',
      day8: 'Return to Tokyo, departure'
    },
    included: [
      'International flights',
      '7 nights accommodation (mix of hotels and ryokan)',
      'JR Pass for transportation',
      'Daily breakfast',
      'Selected traditional meals',
      'English-speaking guide',
      'All entrance fees'
    ],
    excluded: [
      'Visa fees',
      'Some meals',
      'Personal expenses',
      'Optional activities',
      'Travel insurance'
    ],
    status: 'active',
    featured: true,
    created_at: '2024-01-20T10:00:00Z',
    updated_at: '2024-01-20T10:00:00Z',
    maxParticipants: 12,
    image_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&h=600&fit=crop',
    pricing: { basePrice: 1299 }
  }
];

// Export individual tours for easy access
export const featuredTours = mockTours.filter(tour => tour.featured);
export const domesticTours = mockTours.filter(tour => tour.category === 'domestic');
export const outboundTours = mockTours.filter(tour => tour.category === 'outbound');
export const inboundTours = mockTours.filter(tour => tour.category === 'inbound');
