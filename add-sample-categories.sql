-- Sample categories for tours and services
-- Clear existing categories first
DELETE FROM categories;

INSERT INTO categories (name, slug, description, type, icon, color, sort_order, featured, created_at, updated_at) VALUES
-- Tour categories
('Domestic Tours', 'domestic-tours', 'Explore the beauty and culture within your own country', 'tour', 'map-pin', '#10B981', 1, 1, datetime('now'), datetime('now')),
('Inbound Tours', 'inbound-tours', 'Welcome international visitors to discover local attractions', 'tour', 'globe', '#3B82F6', 2, 1, datetime('now'), datetime('now')),
('Outbound Tours', 'outbound-tours', 'International travel packages to destinations worldwide', 'tour', 'plane', '#8B5CF6', 3, 1, datetime('now'), datetime('now')),

-- Service categories
('Car Rental', 'car-rental', 'Vehicle rental services for self-drive tours and transportation', 'service', 'car', '#F59E0B', 4, 1, datetime('now'), datetime('now')),
('Visa Services', 'visa-services', 'Visa application and processing services for international travel', 'service', 'file-text', '#EF4444', 5, 0, datetime('now'), datetime('now')),
('Transportation', 'transportation', 'Airport transfers and private transportation services', 'service', 'truck', '#06B6D4', 6, 1, datetime('now'), datetime('now')),
('Hotel Booking', 'hotel-booking', 'Accommodation booking and reservation services', 'service', 'home', '#EC4899', 7, 0, datetime('now'), datetime('now'));
