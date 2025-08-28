-- Add email settings table for admin configuration
CREATE TABLE IF NOT EXISTS email_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- Insert default email settings
INSERT OR REPLACE INTO email_settings (setting_key, setting_value, description, created_at, updated_at)
VALUES
    ('company_email', 'info@travelcompany.com', 'Company email address for receiving booking notifications', datetime('now'), datetime('now')),
    ('company_name', 'Travel Company', 'Company name used in email signatures', datetime('now'), datetime('now')),
    ('email_from_name', 'Travel Company Team', 'From name displayed in emails', datetime('now'), datetime('now')),
    ('booking_notification_enabled', 'true', 'Enable/disable booking notification emails', datetime('now'), datetime('now')),
    ('customer_confirmation_enabled', 'true', 'Enable/disable customer confirmation emails', datetime('now'), datetime('now')),
    ('admin_notification_subject', 'New Booking Received - {booking_number}', 'Subject template for admin notifications', datetime('now'), datetime('now')),
    ('customer_confirmation_subject', 'Booking Confirmation - {booking_number}', 'Subject template for customer confirmations', datetime('now'), datetime('now'));
