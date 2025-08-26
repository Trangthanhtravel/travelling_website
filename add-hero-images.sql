-- Insert default hero images into content table
INSERT INTO content (key, title, content, type, status, created_at, updated_at) VALUES
('hero_image_1', 'Vietnam Discovery', 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 'setting', 'active', datetime('now'), datetime('now')),
('hero_image_2', 'Travel Adventure', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 'setting', 'active', datetime('now'), datetime('now')),
('hero_image_3', 'Cultural Journey', 'https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', 'setting', 'active', datetime('now'), datetime('now'));

-- Add hero titles and descriptions
INSERT INTO content (key, title, content, type, status, created_at, updated_at) VALUES
('hero_title_1', 'Hero Title 1', 'Discover Amazing Vietnam', 'setting', 'active', datetime('now'), datetime('now')),
('hero_title_2', 'Hero Title 2', 'Travel with TrangThanh', 'setting', 'active', datetime('now'), datetime('now')),
('hero_title_3', 'Hero Title 3', 'Cultural Immersion', 'setting', 'active', datetime('now'), datetime('now')),
('hero_subtitle_1', 'Hero Subtitle 1', 'Experience the beauty and culture of Southeast Asia', 'setting', 'active', datetime('now'), datetime('now')),
('hero_subtitle_2', 'Hero Subtitle 2', 'Professional travel services and unforgettable experiences', 'setting', 'active', datetime('now'), datetime('now')),
('hero_subtitle_3', 'Hero Subtitle 3', 'Dive deep into local traditions and customs', 'setting', 'active', datetime('now'), datetime('now'));
