-- Insert default statistics content into content table
INSERT INTO content (key, title, content, type, status, created_at, updated_at) VALUES
('stats_happy_customers', 'Happy Customers Statistic', '500', 'setting', 'active', datetime('now'), datetime('now')),
('stats_number_of_trips', 'Number of Trips Statistic', '1200', 'setting', 'active', datetime('now'), datetime('now')),
('stats_years_experience', 'Years of Experience Statistic', '15', 'setting', 'active', datetime('now'), datetime('now')),
('stats_google_review', 'Google Review Rating', '4.6', 'setting', 'active', datetime('now'), datetime('now'));

