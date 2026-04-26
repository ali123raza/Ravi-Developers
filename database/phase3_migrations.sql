-- Phase 3 Database Migrations
-- Marketing Tools, System Health, Advanced Settings

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT,
  recipient_type ENUM('all', 'customers', 'inquiries') DEFAULT 'all',
  recipient_count INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  status ENUM('draft', 'scheduled', 'sent', 'failed') DEFAULT 'draft',
  scheduled_at TIMESTAMP NULL,
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- SMS Campaigns Table
CREATE TABLE IF NOT EXISTS sms_campaigns (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_type ENUM('all', 'customers', 'inquiries') DEFAULT 'all',
  recipient_count INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  status ENUM('draft', 'sent', 'failed') DEFAULT 'draft',
  sent_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Promotions/Offers Table
CREATE TABLE IF NOT EXISTS promotions (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type ENUM('percentage', 'fixed') DEFAULT 'percentage',
  discount_value DECIMAL(10, 2) NOT NULL,
  min_booking_amount DECIMAL(15, 2) DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  max_uses INT NULL,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- System Backups Table
CREATE TABLE IF NOT EXISTS system_backups (
  id VARCHAR(36) PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  size BIGINT DEFAULT 0,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  variables JSON,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Advanced Settings Table
CREATE TABLE IF NOT EXISTS advanced_settings (
  id VARCHAR(36) PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default email templates
INSERT INTO email_templates (id, name, subject, body, variables) VALUES
('welcome_template', 'welcome', 'Welcome to Ravi Developers!', 
 '<h1>Welcome {{name}}!</h1><p>Thank you for your interest in Ravi Developers. We will contact you shortly.</p>',
 '["name"]'),
('inquiry_confirmation', 'inquiry_confirmation', 'We Received Your Inquiry',
 '<h1>Thank you {{name}}</h1><p>We have received your inquiry and will get back to you within 24 hours.</p>',
 '["name"]'),
('booking_confirmation', 'booking_confirmation', 'Your Booking is Confirmed',
 '<h1>Booking Confirmed</h1><p>Dear {{name}}, your booking for plot {{plotNumber}} has been confirmed.</p>',
 '["name", "plotNumber"]'),
('payment_receipt', 'payment_receipt', 'Payment Received',
 '<h1>Payment Receipt</h1><p>We received your payment of {{amount}} for booking {{bookingId}}.</p>',
 '["amount", "bookingId"]');

-- Insert default advanced settings
INSERT INTO advanced_settings (id, setting_key, setting_value) VALUES
('lang_default', 'default_language', '"en"'),
('lang_urdu', 'urdu_enabled', 'false'),
('lang_rtl', 'rtl_enabled', 'false'),
('cache_enabled', 'cache_enabled', 'true'),
('cache_duration', 'cache_duration', '3600'),
('maintenance_mode', 'maintenance_mode', 'false'),
('analytics_enabled', 'analytics_enabled', 'false');

-- Create indexes for better performance
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_sms_campaigns_status ON sms_campaigns(status);
CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_code ON promotions(code);
CREATE INDEX idx_backups_status ON system_backups(status);
CREATE INDEX idx_advanced_settings_key ON advanced_settings(setting_key);

-- Note: Integration configurations are stored as JSON in advanced_settings
-- Example: setting_key='integration_twilio', setting_value='{"enabled":true,"apiKey":"xxx"}'
