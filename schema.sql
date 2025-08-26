-- Migration script to override D1 database with new schema
-- WARNING: This will delete all existing data!

-- Drop all existing tables
DROP TABLE IF EXISTS booking_notes;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS blogs;
DROP TABLE IF EXISTS content;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS social_links;

-- Drop all existing indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_tours_slug;
DROP INDEX IF EXISTS idx_tours_status;
DROP INDEX IF EXISTS idx_tours_category;
DROP INDEX IF EXISTS idx_services_category;
DROP INDEX IF EXISTS idx_services_status;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_customer_email;
DROP INDEX IF EXISTS idx_bookings_booking_number;
DROP INDEX IF EXISTS idx_reviews_status;
DROP INDEX IF EXISTS idx_categories_type;

-- Recreate all tables with new schema
-- Categories table for tours and services
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK(type IN ('tour', 'service', 'both')),
    icon TEXT,
    color TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Users table (Admin only)
CREATE TABLE users (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       name TEXT NOT NULL,
                       email TEXT UNIQUE NOT NULL,
                       password TEXT NOT NULL,
                       phone TEXT,
                       role TEXT DEFAULT 'admin' CHECK(role IN ('admin')),
                       created_at TEXT NOT NULL,
                       updated_at TEXT NOT NULL
);

-- Tours table
CREATE TABLE tours (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       title TEXT NOT NULL,
                       slug TEXT UNIQUE NOT NULL,
                       description TEXT,
                       price REAL NOT NULL,
                       duration TEXT,
                       max_participants INTEGER,
                       included TEXT,
                       excluded TEXT,
                       itinerary TEXT,
                       images TEXT,
                       status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'draft')),
                       featured BOOLEAN DEFAULT FALSE,
                       category TEXT DEFAULT 'domestic' CHECK(category IN ('domestic', 'inbound', 'outbound')),
                       location TEXT,
                       created_at TEXT NOT NULL,
                       updated_at TEXT NOT NULL
);

-- Services table
CREATE TABLE services (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          title TEXT NOT NULL,
                          subtitle TEXT,
                          description TEXT,
                          price REAL NOT NULL,
                          duration TEXT,
                          images TEXT,
                          included TEXT,
                          excluded TEXT,
                          category_id INTEGER,
                          service_type TEXT NOT NULL CHECK(service_type IN ('tours', 'car-rental', 'other-services')),
                          status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
                          created_at TEXT NOT NULL,
                          updated_at TEXT NOT NULL,
                          FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Direct Bookings table (no user account required)
CREATE TABLE bookings (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          booking_number TEXT UNIQUE NOT NULL,
                          type TEXT NOT NULL CHECK(type IN ('tour', 'service')),
                          item_id INTEGER NOT NULL,
                          customer_name TEXT NOT NULL,
                          customer_email TEXT NOT NULL,
                          customer_phone TEXT NOT NULL,
                          start_date TEXT NOT NULL,
                          total_travelers INTEGER NOT NULL,
                          special_requests TEXT,
                          total_amount REAL NOT NULL,
                          currency TEXT DEFAULT 'USD',
                          status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'contacted', 'completed', 'cancelled')),
                          contacted_at TEXT,
                          confirmed_at TEXT,
                          created_at TEXT NOT NULL,
                          updated_at TEXT NOT NULL
);

-- Booking notes table (for admin use)
CREATE TABLE booking_notes (
                               id INTEGER PRIMARY KEY AUTOINCREMENT,
                               booking_id INTEGER NOT NULL,
                               content TEXT NOT NULL,
                               created_by INTEGER NOT NULL,
                               created_at TEXT NOT NULL,
                               FOREIGN KEY (booking_id) REFERENCES bookings(id),
                               FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Reviews table (now accepts reviews from non-registered customers)
CREATE TABLE reviews (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         service_id INTEGER,
                         tour_id INTEGER,
                         customer_name TEXT NOT NULL,
                         customer_email TEXT NOT NULL,
                         rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
                         title TEXT,
                         comment TEXT,
                         status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
                         created_at TEXT NOT NULL,
                         updated_at TEXT NOT NULL,
                         FOREIGN KEY (service_id) REFERENCES services(id),
                         FOREIGN KEY (tour_id) REFERENCES tours(id)
);

-- Blogs table
CREATE TABLE blogs (
                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                       type TEXT DEFAULT 'blog',
                       title TEXT NOT NULL,
                       slug TEXT UNIQUE NOT NULL,
                       content TEXT NOT NULL,
                       excerpt TEXT,
                       featured_image TEXT,
                       gallery TEXT,
                       author INTEGER NOT NULL,
                       status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
                       featured BOOLEAN DEFAULT FALSE,
                       categories TEXT,
                       tags TEXT,
                       language TEXT DEFAULT 'en',
                       seo_meta_title TEXT,
                       seo_meta_description TEXT,
                       seo_keywords TEXT,
                       views INTEGER DEFAULT 0,
                       reading_time INTEGER,
                       published_at TEXT,
                       created_at TEXT NOT NULL,
                       updated_at TEXT NOT NULL,
                       FOREIGN KEY (author) REFERENCES users(id)
);

-- Content management table
CREATE TABLE content (
                         id INTEGER PRIMARY KEY AUTOINCREMENT,
                         key TEXT UNIQUE NOT NULL,
                         title TEXT,
                         content TEXT,
                         type TEXT CHECK(type IN ('page', 'section', 'setting')),
                         language TEXT DEFAULT 'en',
                         status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
                         created_at TEXT NOT NULL,
                         updated_at TEXT NOT NULL
);

-- Social Links table for contact chat box
CREATE TABLE social_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL CHECK(platform IN ('facebook', 'zalo', 'email', 'phone')),
    url TEXT NOT NULL,
    display_text TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_category ON tours(category_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_categories_type ON categories(type);

-- Insert a default admin user (change password before production!)
INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES (
           'Admin User',
           'admin@example.com',
           '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: "password"
           'admin',
           datetime('now'),
           datetime('now')
       );

-- Insert default categories
INSERT INTO categories (name, slug, description, type, icon, color, sort_order, created_at, updated_at) VALUES
('Tour Packages', 'tours', 'Guided tours and travel packages', 'both', 'FiMapPin', '#3B82F6', 1, datetime('now'), datetime('now')),
('Car Rental', 'car-rental', 'Vehicle rental services', 'service', 'FiTruck', '#10B981', 2, datetime('now'), datetime('now')),
('Hotel Booking', 'hotel-booking', 'Accommodation booking services', 'service', 'FiHome', '#8B5CF6', 3, datetime('now'), datetime('now')),
('Train Booking', 'train-booking', 'Railway transportation booking', 'service', 'FiNavigation', '#F59E0B', 4, datetime('now'), datetime('now')),
('Cruise', 'cruise', 'Cruise ship travel experiences', 'both', 'FiAnchor', '#06B6D4', 5, datetime('now'), datetime('now')),
('Visa Services', 'visa-service', 'Visa processing and documentation', 'service', 'FiFileText', '#EF4444', 6, datetime('now'), datetime('now')),
('Cultural Tours', 'cultural', 'Cultural and heritage tours', 'tour', 'FiUsers', '#EC4899', 7, datetime('now'), datetime('now')),
('Adventure Tours', 'adventure', 'Adventure and outdoor activities', 'tour', 'FiMountain', '#F97316', 8, datetime('now'), datetime('now')),
('Business Travel', 'business', 'Business and corporate travel', 'both', 'FiBriefcase', '#6366F1', 9, datetime('now'), datetime('now')),
('Family Packages', 'family', 'Family-friendly travel packages', 'both', 'FiHeart', '#14B8A6', 10, datetime('now'), datetime('now'));
