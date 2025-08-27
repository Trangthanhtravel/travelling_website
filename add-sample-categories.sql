-- Sample categories for tours and services
INSERT INTO categories (name, slug, description, type, icon, color, sort_order, created_at, updated_at) VALUES
-- Tour categories are handled by the category field in tours table (domestic, inbound, outbound)
-- Service categories
('Car Rental', 'car-rental', 'Vehicle rental services for self-drive tours and transportation', 'service', 'car', '#3B82F6', 1, datetime('now'), datetime('now')),
('Visa Services', 'visa-services', 'Visa application and processing services for international travel', 'service', 'passport', '#10B981', 2, datetime('now'), datetime('now')),
('Transportation', 'transportation', 'Airport transfers and private transportation services', 'service', 'bus', '#8B5CF6', 3, datetime('now'), datetime('now')),
('Travel Insurance', 'travel-insurance', 'Comprehensive travel insurance coverage', 'service', 'shield', '#F59E0B', 4, datetime('now'), datetime('now')),
('Hotel Booking', 'hotel-booking', 'Accommodation booking and reservation services', 'service', 'home', '#EF4444', 5, datetime('now'), datetime('now')),
('Tour Packages', 'tour-packages', 'Complete tour packages with guided experiences', 'both', 'map', '#06B6D4', 6, datetime('now'), datetime('now'));

