export interface Blog {
  id: number;
  type: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  gallery: string[];
  author: number;
  authorName?: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  categories: string[];
  tags: string[];
  language: string;
  seo_meta_title: string;
  seo_meta_description: string;
  seo_keywords: string[];
  views: number;
  reading_time: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export const mockBlogs: Blog[] = [
  {
    id: 1,
    type: 'blog',
    title: 'Top 10 Hidden Gems in Vietnam You Must Visit',
    slug: 'top-10-hidden-gems-vietnam-must-visit',
    content: `<div class="blog-content">
      <p>Vietnam is a country of stunning natural beauty, rich culture, and fascinating history. While popular destinations like Ha Long Bay and Ho Chi Minh City attract millions of visitors, there are countless hidden gems waiting to be discovered.</p>
      
      <h2>1. Ban Gioc Falls - The Majestic Border Waterfall</h2>
      <p>Located on the border between Vietnam and China, Ban Gioc Falls is one of the largest waterfalls in Vietnam. The multi-tiered cascade creates a breathtaking spectacle, especially during the rainy season when the water flow is at its peak.</p>
      
      <h2>2. Phong Nha-Ke Bang National Park</h2>
      <p>Home to some of the world's largest caves, including the famous Son Tra Cave. This UNESCO World Heritage site offers incredible underground adventures and pristine jungle landscapes.</p>
      
      <h2>3. Con Dao Islands</h2>
      <p>Once a prison island, Con Dao has transformed into a paradise for eco-tourists. Crystal clear waters, pristine beaches, and rich marine life make it perfect for diving and relaxation.</p>
      
      <h2>4. Ha Giang Loop</h2>
      <p>The northernmost province of Vietnam offers spectacular mountain scenery, ethnic minority villages, and winding roads perfect for motorbike adventures.</p>
      
      <h2>5. Bac Ha Market</h2>
      <p>Every Sunday, this colorful market comes alive with ethnic minorities from surrounding villages selling traditional crafts, fresh produce, and local delicacies.</p>
      
      <h2>Planning Your Adventure</h2>
      <p>When visiting these hidden gems, it's essential to plan ahead. Many locations require special permits or local guides. Weather conditions can vary dramatically, so check seasonal recommendations before traveling.</p>
      
      <p>Consider booking a customized tour with local experts who know these areas intimately. They can provide insights into local culture, ensure your safety, and help you experience these destinations authentically.</p>
    </div>`,
    excerpt: 'Discover Vietnam\'s best-kept secrets with our guide to 10 incredible hidden destinations that offer authentic experiences away from the crowds.',
    featured_image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop'
    ],
    author: 1,
    authorName: 'Sarah Johnson',
    status: 'published',
    featured: true,
    categories: ['Travel Tips', 'Hidden Gems', 'Vietnam'],
    tags: ['vietnam', 'hidden gems', 'travel', 'adventure', 'nature'],
    language: 'en',
    seo_meta_title: 'Top 10 Hidden Gems in Vietnam - Undiscovered Travel Destinations',
    seo_meta_description: 'Explore Vietnam\'s hidden gems with our comprehensive guide to 10 stunning undiscovered destinations perfect for adventurous travelers.',
    seo_keywords: ['vietnam hidden gems', 'undiscovered vietnam', 'vietnam travel', 'off beaten path vietnam'],
    views: 2847,
    reading_time: 8,
    published_at: '2024-01-15T09:00:00Z',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T09:00:00Z'
  },
  {
    id: 2,
    type: 'blog',
    title: 'Essential Packing Guide for Southeast Asia Travel',
    slug: 'essential-packing-guide-southeast-asia-travel',
    content: `<div class="blog-content">
      <p>Traveling to Southeast Asia requires smart packing due to the region's tropical climate, diverse activities, and varying infrastructure. Here's your comprehensive packing guide.</p>
      
      <h2>Climate Considerations</h2>
      <p>Southeast Asia has a tropical climate with high humidity year-round. Pack lightweight, breathable fabrics like cotton and linen. Avoid synthetic materials that don't breathe well.</p>
      
      <h2>Essential Clothing Items</h2>
      <ul>
        <li>Lightweight, long-sleeved shirts (protection from mosquitoes and sun)</li>
        <li>Quick-dry shorts and pants</li>
        <li>Comfortable walking shoes and sandals</li>
        <li>Rain jacket or poncho</li>
        <li>Wide-brimmed hat</li>
        <li>Modest clothing for temple visits</li>
      </ul>
      
      <h2>Health and Safety Essentials</h2>
      <p>Pack a comprehensive first aid kit including:</p>
      <ul>
        <li>High-SPF sunscreen</li>
        <li>Insect repellent with DEET</li>
        <li>Hand sanitizer</li>
        <li>Water purification tablets</li>
        <li>Basic medications</li>
        <li>Mosquito net (for rural areas)</li>
      </ul>
      
      <h2>Electronics and Documents</h2>
      <p>Don't forget universal power adapters, portable chargers, and waterproof cases for your electronics. Keep digital and physical copies of important documents.</p>
      
      <h2>Money and Payment</h2>
      <p>While cards are increasingly accepted, cash is still king in many areas. Notify your bank of travel plans and carry some USD as backup.</p>
    </div>`,
    excerpt: 'Pack smart for your Southeast Asia adventure with our comprehensive guide covering everything from climate considerations to essential gear.',
    featured_image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop'
    ],
    author: 1,
    authorName: 'Sarah Johnson',
    status: 'published',
    featured: false,
    categories: ['Travel Tips', 'Packing Guide'],
    tags: ['packing', 'southeast asia', 'travel tips', 'backpacking'],
    language: 'en',
    seo_meta_title: 'Ultimate Southeast Asia Packing Guide - What to Pack for Your Trip',
    seo_meta_description: 'Complete packing checklist for Southeast Asia travel including clothing, health essentials, and smart packing tips for tropical climates.',
    seo_keywords: ['southeast asia packing', 'travel packing guide', 'tropical packing tips'],
    views: 1923,
    reading_time: 6,
    published_at: '2024-01-20T10:00:00Z',
    created_at: '2024-01-20T09:00:00Z',
    updated_at: '2024-01-20T10:00:00Z'
  },
  {
    id: 3,
    type: 'blog',
    title: 'Street Food Adventures: A Culinary Journey Through Vietnam',
    slug: 'street-food-adventures-culinary-journey-vietnam',
    content: `<div class="blog-content">
      <p>Vietnamese street food is an integral part of the country's culture and offers some of the most delicious and affordable meals you'll ever taste.</p>
      
      <h2>Pho - The National Dish</h2>
      <p>No trip to Vietnam is complete without trying authentic pho. This aromatic noodle soup varies by region, with northern versions being more subtle and southern versions including more herbs and vegetables.</p>
      
      <h2>Banh Mi - The Perfect Fusion</h2>
      <p>A legacy of French colonialism, banh mi combines French bread with Vietnamese ingredients, creating the perfect portable meal.</p>
      
      <h2>Regional Specialties</h2>
      <h3>North Vietnam</h3>
      <ul>
        <li>Bun Cha - Grilled pork with noodles</li>
        <li>Cha Ca - Turmeric fish with dill</li>
        <li>Egg Coffee - Hanoi's famous creamy coffee</li>
      </ul>
      
      <h3>Central Vietnam</h3>
      <ul>
        <li>Cao Lau - Hoi An's signature noodle dish</li>
        <li>Bun Bo Hue - Spicy beef noodle soup</li>
        <li>White Rose Dumplings - Hoi An specialty</li>
      </ul>
      
      <h3>South Vietnam</h3>
      <ul>
        <li>Com Tam - Broken rice with grilled pork</li>
        <li>Hu Tieu - Clear noodle soup</li>
        <li>Che - Sweet dessert soup</li>
      </ul>
      
      <h2>Street Food Safety Tips</h2>
      <p>Choose busy stalls with high turnover, watch your food being prepared, and trust your instincts. If something doesn't look or smell right, move on to another vendor.</p>
    </div>`,
    excerpt: 'Explore Vietnam\'s incredible street food scene with our guide to must-try dishes, regional specialties, and safety tips for food adventures.',
    featured_image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1593560704563-f176a2eb61db?w=800&h=600&fit=crop'
    ],
    author: 2,
    authorName: 'Mike Chen',
    status: 'published',
    featured: true,
    categories: ['Food & Drink', 'Culture', 'Vietnam'],
    tags: ['vietnamese food', 'street food', 'culinary travel', 'food guide'],
    language: 'en',
    seo_meta_title: 'Vietnamese Street Food Guide - Best Dishes to Try in Vietnam',
    seo_meta_description: 'Discover Vietnam\'s amazing street food scene with our comprehensive guide to must-try dishes, regional specialties, and food safety tips.',
    seo_keywords: ['vietnamese street food', 'vietnam food guide', 'pho', 'banh mi'],
    views: 3156,
    reading_time: 7,
    published_at: '2024-01-25T11:00:00Z',
    created_at: '2024-01-25T10:00:00Z',
    updated_at: '2024-01-25T11:00:00Z'
  },
  {
    id: 4,
    type: 'blog',
    title: 'Budget Travel Tips: Exploring Asia on $30 a Day',
    slug: 'budget-travel-tips-exploring-asia-30-dollars-day',
    content: `<div class="blog-content">
      <p>Traveling through Asia doesn't have to break the bank. With careful planning and smart choices, you can explore this incredible continent on just $30 a day.</p>
      
      <h2>Accommodation Strategies</h2>
      <p>Hostels, guesthouses, and homestays offer excellent value. In many Asian countries, you can find clean, comfortable accommodation for $5-15 per night.</p>
      
      <h2>Transportation Hacks</h2>
      <ul>
        <li>Use local buses instead of tourist buses</li>
        <li>Travel overnight to save on accommodation</li>
        <li>Book flights in advance during off-peak seasons</li>
        <li>Consider slow travel to reduce transport costs</li>
      </ul>
      
      <h2>Food Budget Tips</h2>
      <p>Street food and local markets offer incredible meals for $1-3. Avoid tourist restaurants and eat where locals eat for authentic and affordable experiences.</p>
      
      <h2>Free and Cheap Activities</h2>
      <ul>
        <li>Explore temples and religious sites</li>
        <li>Hike national parks and nature trails</li>
        <li>Visit local markets and festivals</li>
        <li>Take advantage of free walking tours</li>
        <li>Relax on public beaches</li>
      </ul>
      
      <h2>Money-Saving Tools</h2>
      <p>Use travel reward credit cards, download currency conversion apps, and consider travel insurance to avoid unexpected costs.</p>
    </div>`,
    excerpt: 'Learn how to explore Asia on a shoestring budget with practical tips for accommodation, transportation, food, and activities that won\'t break the bank.',
    featured_image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop'
    ],
    author: 1,
    authorName: 'Sarah Johnson',
    status: 'published',
    featured: false,
    categories: ['Budget Travel', 'Travel Tips'],
    tags: ['budget travel', 'backpacking', 'cheap travel', 'asia travel'],
    language: 'en',
    seo_meta_title: 'Budget Travel Asia - How to Travel Asia on $30 a Day',
    seo_meta_description: 'Complete guide to budget travel in Asia with tips for accommodation, food, transport and activities on just $30 per day.',
    seo_keywords: ['budget travel asia', 'cheap travel asia', 'backpacking asia budget'],
    views: 4201,
    reading_time: 5,
    published_at: '2024-02-01T08:00:00Z',
    created_at: '2024-02-01T07:00:00Z',
    updated_at: '2024-02-01T08:00:00Z'
  },
  {
    id: 5,
    type: 'blog',
    title: 'Photography Tips for Capturing Perfect Travel Moments',
    slug: 'photography-tips-capturing-perfect-travel-moments',
    content: `<div class="blog-content">
      <p>Travel photography is about more than just documenting your journey—it's about capturing the essence of places and creating lasting memories.</p>
      
      <h2>Essential Camera Gear</h2>
      <p>While smartphone cameras have improved dramatically, a dedicated camera offers more control and better image quality. Consider a mirrorless camera for the best balance of quality and portability.</p>
      
      <h2>Composition Techniques</h2>
      <ul>
        <li>Rule of thirds for balanced compositions</li>
        <li>Leading lines to guide the viewer's eye</li>
        <li>Framing to create depth and context</li>
        <li>Symmetry and patterns for visual impact</li>
      </ul>
      
      <h2>Golden Hour Magic</h2>
      <p>The hour after sunrise and before sunset provides the most flattering light for photography. Plan your shooting schedule around these times for stunning results.</p>
      
      <h2>Cultural Sensitivity</h2>
      <p>Always ask permission before photographing people, especially in religious or traditional settings. Respect local customs and be mindful of photography restrictions.</p>
      
      <h2>Post-Processing Tips</h2>
      <p>Learn basic editing techniques to enhance your photos. Apps like Lightroom Mobile make professional-level editing possible on the go.</p>
    </div>`,
    excerpt: 'Master the art of travel photography with professional tips for composition, lighting, cultural sensitivity, and post-processing techniques.',
    featured_image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&h=800&fit=crop',
    gallery: [
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=800&h=600&fit=crop'
    ],
    author: 3,
    authorName: 'Lisa Park',
    status: 'published',
    featured: true,
    categories: ['Photography', 'Travel Tips'],
    tags: ['travel photography', 'photography tips', 'camera gear', 'composition'],
    language: 'en',
    seo_meta_title: 'Travel Photography Tips - How to Capture Perfect Travel Photos',
    seo_meta_description: 'Learn professional travel photography techniques including composition, lighting, cultural sensitivity, and gear recommendations.',
    seo_keywords: ['travel photography', 'photography tips', 'travel photos', 'camera techniques'],
    views: 2689,
    reading_time: 6,
    published_at: '2024-02-05T09:00:00Z',
    created_at: '2024-02-05T08:00:00Z',
    updated_at: '2024-02-05T09:00:00Z'
  }
];

// Mock admin users for blog authors
export const mockAdminUsers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@travelcompany.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Mike Chen',
    email: 'mike@travelcompany.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Lisa Park',
    email: 'lisa@travelcompany.com',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z'
  }
];

// Export filtered blogs
export const featuredBlogs = mockBlogs.filter(blog => blog.featured);
export const publishedBlogs = mockBlogs.filter(blog => blog.status === 'published');
