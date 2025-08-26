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
DROP TABLE IF EXISTS users;

-- Drop all existing indexes
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_tours_slug;
DROP INDEX IF EXISTS idx_tours_status;
DROP INDEX IF EXISTS idx_services_category;
DROP INDEX IF EXISTS idx_services_status;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_customer_email;
DROP INDEX IF EXISTS idx_reviews_status;

-- Recreate all tables with new schema
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
    category TEXT,
    location TEXT,
    difficulty TEXT CHECK(difficulty IN ('easy', 'moderate', 'hard')),
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
    category TEXT NOT NULL,
    service_type TEXT NOT NULL CHECK(service_type IN ('tours', 'car-rental', 'other-services')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Direct Bookings table (no user account required)
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX idx_reviews_status ON reviews(status);

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
