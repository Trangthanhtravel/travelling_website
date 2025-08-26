-- Insert default social links for the traveling company
-- Run this after the main schema.sql to populate with default social media links

INSERT INTO social_links (platform, url, display_text, is_active, sort_order, created_at, updated_at) VALUES
('facebook', 'https://facebook.com/yourcompany', 'Follow us on Facebook', 1, 1, datetime('now'), datetime('now')),
('email', 'info@travelworld.com', 'Send us an email', 1, 2, datetime('now'), datetime('now')),
('phone', '+84-123-456-789', 'Call us now', 1, 3, datetime('now'), datetime('now')),
('zalo', 'https://zalo.me/yourcompany', 'Chat with us on Zalo', 1, 4, datetime('now'), datetime('now'));
