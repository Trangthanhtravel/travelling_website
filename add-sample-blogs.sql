-- Sample blog data for the travelling website
-- This will add some sample blogs to demonstrate the blog functionality

INSERT INTO blogs (
    title,
    slug,
    content,
    excerpt,
    featured_image,
    gallery,
    author,
    status,
    featured,
    categories,
    tags,
    language,
    seo_meta_title,
    seo_meta_description,
    seo_keywords,
    views,
    reading_time,
    published_at,
    created_at,
    updated_at
) VALUES
(
    'Hidden Gems of Northern Vietnam',
    'hidden-gems-northern-vietnam',
    '<p>Discover the breathtaking landscapes and rich culture of Northern Vietnam beyond the typical tourist trails. From the misty mountains of Sapa to the pristine lakes of Ba Be National Park, this region offers unforgettable experiences for adventurous travelers.</p>

    <h2>Sapa - Beyond the Tourist Trail</h2>
    <p>While most visitors stick to the main town, venture into the remote villages of Ta Van and Ta Phin to experience authentic hill tribe culture. Stay in a traditional homestay and wake up to stunning sunrise views over the terraced rice fields.</p>

    <h2>Ba Be National Park</h2>
    <p>This hidden gem features Vietnam''s largest natural lake, surrounded by limestone karsts and dense forests. Take a boat trip to explore hidden caves and visit the Tay ethnic minority villages around the lake.</p>

    <h2>Ha Giang Loop</h2>
    <p>The northernmost province offers some of Vietnam''s most spectacular mountain scenery. The winding roads through Dong Van Karst Plateau Geopark provide breathtaking views and cultural encounters with local ethnic groups.</p>

    <h2>Local Cuisine Highlights</h2>
    <p>Don''t miss trying specialties like thang co (horse meat soup), men men (corn flour dish), and the famous Sapa salmon. Each region has its unique flavors influenced by various ethnic traditions.</p>',
    'Explore remote villages, pristine lakes, and mountain passes that few tourists ever see in this comprehensive guide to Northern Vietnam''s hidden treasures.',
    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    '[]',
    1,
    'published',
    true,
    'Travel Tips,Vietnam,Adventure',
    'northern vietnam,hidden gems,adventure,culture,sapa,ba be',
    'en',
    'Hidden Gems of Northern Vietnam - Off the Beaten Path Adventure Guide',
    'Discover secret destinations in Northern Vietnam including Sapa villages, Ba Be National Park, and Ha Giang Loop. Complete travel guide with insider tips.',
    'vietnam travel,hidden gems,northern vietnam,adventure travel,sapa,ba be national park',
    1250,
    8,
    datetime('now', '-15 days'),
    datetime('now', '-15 days'),
    datetime('now', '-15 days')
),
(
    'Ultimate Guide to Japanese Cherry Blossom Season',
    'japanese-cherry-blossom-guide',
    '<p>Experience the magic of sakura season with our comprehensive guide to Japan''s most beautiful cherry blossom viewing spots and cultural traditions.</p>

    <h2>Best Times to Visit</h2>
    <p>Cherry blossom season varies by region, typically starting in late January in Okinawa and reaching northern Honshu by late April. Peak bloom in Tokyo usually occurs in early April.</p>

    <h2>Top Viewing Locations</h2>
    <h3>Tokyo</h3>
    <p>Ueno Park, Shinjuku Gyoen, and Chidorigafuchi are among the most popular spots. For fewer crowds, try Inokashira Park or the gardens of the Imperial Palace.</p>

    <h3>Kyoto</h3>
    <p>The Philosopher''s Path (Tetsugaku-no-michi) offers a romantic stroll under cherry tree tunnels. Don''t miss the spectacular views at Kiyomizu-dera Temple.</p>

    <h3>Osaka</h3>
    <p>Osaka Castle Park hosts over 4,000 cherry trees and is perfect for hanami parties. The illuminated evening views are particularly stunning.</p>

    <h2>Hanami Traditions</h2>
    <p>Hanami (flower viewing) is more than just looking at blossoms. It''s about gathering with friends and family for picnics under the trees, celebrating the fleeting beauty of spring.</p>

    <h2>Photography Tips</h2>
    <p>Early morning and late afternoon provide the best lighting. Use a polarizing filter to reduce glare and enhance the pink tones of the blossoms.</p>',
    'Everything you need to know about when, where, and how to experience Japan''s famous cherry blossom season, including the best viewing spots and cultural traditions.',
    'https://images.unsplash.com/photo-1522383225653-ed111181a951?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    '[]',
    1,
    'published',
    false,
    'Japan,Seasonal Travel,Photography',
    'japan,cherry blossom,sakura,spring travel,hanami,tokyo,kyoto,osaka',
    'en',
    'Japanese Cherry Blossom Season Guide - Best Times & Places to Visit',
    'Complete guide to experiencing Japan''s cherry blossom season with best viewing spots, timing, and cultural traditions. Plan your perfect sakura trip.',
    'japan cherry blossom,sakura season,hanami,japan travel guide,spring in japan',
    892,
    6,
    datetime('now', '-10 days'),
    datetime('now', '-10 days'),
    datetime('now', '-10 days')
),
(
    'Sustainable Travel: How to Explore Responsibly',
    'sustainable-travel-guide',
    '<p>Learn how to minimize your environmental impact while maximizing your travel experiences with these practical sustainable travel tips.</p>

    <h2>Transportation Choices</h2>
    <p>Choose direct flights when possible, as takeoffs and landings produce the most emissions. Consider overland travel for shorter distances - trains and buses often have lower carbon footprints than flying.</p>

    <h2>Accommodation</h2>
    <p>Look for eco-certified hotels or choose locally-owned accommodations. Many properties now have sustainability programs including renewable energy, water conservation, and waste reduction initiatives.</p>

    <h2>Local Engagement</h2>
    <p>Support local economies by eating at family-owned restaurants, shopping at local markets, and booking tours with community-based operators. This ensures your money directly benefits local communities.</p>

    <h2>Wildlife and Nature</h2>
    <p>Follow Leave No Trace principles when hiking or visiting natural areas. Maintain safe distances from wildlife and never feed animals. Choose ethical wildlife encounters that prioritize animal welfare.</p>

    <h2>Cultural Respect</h2>
    <p>Research local customs and dress codes before visiting. Learn basic phrases in the local language and be respectful of religious sites and cultural traditions.</p>

    <h2>Waste Reduction</h2>
    <p>Bring a reusable water bottle, shopping bag, and utensils. Avoid single-use plastics and properly dispose of waste. Consider packing reef-safe sunscreen to protect marine ecosystems.</p>',
    'Discover how to travel responsibly with practical tips for reducing your environmental impact while supporting local communities and preserving destinations for future generations.',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    '[]',
    1,
    'published',
    true,
    'Sustainable Travel,Eco-Tourism,Travel Tips',
    'sustainable travel,eco tourism,responsible travel,green travel,environmental impact',
    'en',
    'Sustainable Travel Guide - How to Travel Responsibly and Ethically',
    'Learn practical sustainable travel tips to minimize environmental impact while supporting local communities. Complete guide to responsible tourism.',
    'sustainable travel,eco tourism,responsible travel,green travel tips,ethical tourism',
    634,
    7,
    datetime('now', '-5 days'),
    datetime('now', '-5 days'),
    datetime('now', '-5 days')
),
(
    'Street Food Adventures in Southeast Asia',
    'southeast-asia-street-food',
    '<p>Embark on a culinary journey through Southeast Asia''s vibrant street food scene, from Bangkok''s floating markets to Singapore''s hawker centers.</p>

    <h2>Thailand - Land of Flavors</h2>
    <p>Bangkok''s street food is legendary. Try pad thai from a roadside cart, som tam (papaya salad) from Chatuchak Market, and don''t miss the boat noodles in Khlong Toei.</p>

    <h3>Must-Try Dishes:</h3>
    <ul>
    <li>Tom Yum Goong - Spicy shrimp soup</li>
    <li>Mango Sticky Rice - Perfect sweet ending</li>
    <li>Grilled Satay - Marinated meat skewers</li>
    </ul>

    <h2>Vietnam - Fresh and Fragrant</h2>
    <p>Vietnamese street food emphasizes fresh herbs and balanced flavors. Pho is just the beginning - explore bun cha in Hanoi and banh mi throughout the country.</p>

    <h2>Malaysia - Fusion Paradise</h2>
    <p>Malaysia''s diverse culture creates incredible fusion street food. Kuala Lumpur''s Jalan Alor and Penang''s Georgetown offer endless discoveries.</p>

    <h2>Singapore - Hawker Heaven</h2>
    <p>Singapore''s hawker centers are UNESCO-recognized for good reason. Try Hainanese chicken rice, laksa, and chili crab at Maxwell Food Centre or Lau Pa Sat.</p>

    <h2>Safety Tips</h2>
    <p>Look for busy stalls with high turnover, eat where locals eat, and trust your instincts. Start slowly to let your stomach adjust to new flavors and spices.</p>',
    'A foodie''s guide to the best street food experiences across Southeast Asia, featuring must-try dishes, hidden gems, and essential safety tips for culinary adventures.',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    '[]',
    1,
    'published',
    false,
    'Food Travel,Southeast Asia,Culture',
    'street food,southeast asia,thailand,vietnam,malaysia,singapore,food travel',
    'en',
    'Southeast Asia Street Food Guide - Culinary Adventures & Local Flavors',
    'Discover the best street food in Southeast Asia with our comprehensive guide to Thailand, Vietnam, Malaysia, and Singapore''s culinary treasures.',
    'southeast asia street food,thailand food,vietnam food,singapore hawker,malaysia street food',
    756,
    9,
    datetime('now', '-3 days'),
    datetime('now', '-3 days'),
    datetime('now', '-3 days')
),
(
    'Digital Nomad Destinations: Best Cities for Remote Work',
    'digital-nomad-destinations-2024',
    '<p>Discover the top destinations for digital nomads in 2024, featuring affordable living costs, reliable internet, and vibrant communities of remote workers.</p>

    <h2>Lisbon, Portugal</h2>
    <p>Lisbon has emerged as Europe''s digital nomad capital with its D7 visa program, excellent coworking spaces, and perfect work-life balance. The city offers fast internet, reasonable costs, and a thriving international community.</p>

    <h2>Medellín, Colombia</h2>
    <p>Known as the "City of Eternal Spring," Medellín offers year-round perfect weather, very low living costs, and a growing tech scene. The city has invested heavily in coworking spaces and digital infrastructure.</p>

    <h2>Canggu, Bali</h2>
    <p>Bali''s beach town combines tropical paradise with excellent digital nomad infrastructure. Coworking spaces, beach clubs with WiFi, and a massive expat community make it ideal for remote work.</p>

    <h2>Mexico City, Mexico</h2>
    <p>CDMX offers rich culture, incredible food, and a cost of living that''s a fraction of major US cities. The Roma Norte and Condesa neighborhoods are particularly popular with digital nomads.</p>

    <h2>Dubai, UAE</h2>
    <p>For those seeking luxury and tax benefits, Dubai''s new remote work visa and world-class infrastructure make it attractive for high-earning nomads. The city is also a great base for exploring Asia and Africa.</p>

    <h2>Essential Considerations</h2>
    <ul>
    <li>Internet speed and reliability</li>
    <li>Time zone compatibility with clients</li>
    <li>Cost of living vs. quality of life</li>
    <li>Visa requirements and duration</li>
    <li>Healthcare and safety</li>
    </ul>',
    'The ultimate guide to the best digital nomad destinations in 2024, featuring cities with great infrastructure, affordable living, and thriving remote work communities.',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    '[]',
    1,
    'published',
    true,
    'Digital Nomad,Remote Work,Travel',
    'digital nomad,remote work,work from anywhere,nomad destinations,coworking',
    'en',
    'Best Digital Nomad Destinations 2024 - Remote Work Paradise Guide',
    'Discover top digital nomad destinations with excellent WiFi, affordable living, and great communities. Complete guide for remote workers and location-independent professionals.',
    'digital nomad destinations,remote work cities,best places for nomads,work from anywhere',
    1543,
    10,
    datetime('now', '-1 days'),
    datetime('now', '-1 days'),
    datetime('now', '-1 days')
);
