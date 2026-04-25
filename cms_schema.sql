-- CMS Schema for Ravi Developers
-- Run this to add CMS tables to existing database

-- Page sections management (for all dynamic content)
CREATE TABLE IF NOT EXISTS page_sections (
  id VARCHAR(36) PRIMARY KEY,
  page VARCHAR(50) NOT NULL, -- 'home', 'about', 'contact', 'gallery', 'footer', 'navbar'
  section_key VARCHAR(100) NOT NULL, -- 'hero', 'features', 'cta', 'stats', 'story'
  title VARCHAR(255),
  subtitle VARCHAR(500),
  content JSON,
  images JSON,
  buttons JSON, -- CTA buttons array
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_page_section (page, section_key)
);

-- Theme settings (full color customization)
CREATE TABLE IF NOT EXISTS theme_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  -- Primary Colors
  primary_color VARCHAR(20) DEFAULT '#dc2626',
  primary_hover VARCHAR(20) DEFAULT '#b91c1c',
  primary_light VARCHAR(20) DEFAULT '#fef2f2',
  -- Secondary Colors
  secondary_color VARCHAR(20) DEFAULT '#111827',
  secondary_hover VARCHAR(20) DEFAULT '#1f2937',
  -- Background Colors
  background_main VARCHAR(20) DEFAULT '#ffffff',
  background_alt VARCHAR(20) DEFAULT '#f9fafb',
  background_dark VARCHAR(20) DEFAULT '#111827',
  -- Text Colors
  text_primary VARCHAR(20) DEFAULT '#111827',
  text_secondary VARCHAR(20) DEFAULT '#6b7280',
  text_light VARCHAR(20) DEFAULT '#9ca3af',
  text_white VARCHAR(20) DEFAULT '#ffffff',
  -- Border Colors
  border_light VARCHAR(20) DEFAULT '#e5e7eb',
  border_medium VARCHAR(20) DEFAULT '#d1d5db',
  -- Accent Colors
  accent_success VARCHAR(20) DEFAULT '#22c55e',
  accent_warning VARCHAR(20) DEFAULT '#f59e0b',
  accent_error VARCHAR(20) DEFAULT '#ef4444',
  -- Typography
  font_family VARCHAR(50) DEFAULT 'Inter',
  font_heading VARCHAR(50) DEFAULT 'Inter',
  -- Assets
  logo_url VARCHAR(500),
  logo_dark_url VARCHAR(500),
  favicon_url VARCHAR(500),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Navigation/menu management
CREATE TABLE IF NOT EXISTS navigation (
  id VARCHAR(36) PRIMARY KEY,
  label VARCHAR(100) NOT NULL,
  href VARCHAR(200) NOT NULL,
  parent_id VARCHAR(36) NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_external BOOLEAN DEFAULT false,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES navigation(id) ON DELETE CASCADE
);

-- SEO settings per page
CREATE TABLE IF NOT EXISTS seo_settings (
  id VARCHAR(36) PRIMARY KEY,
  page VARCHAR(50) NOT NULL UNIQUE,
  meta_title VARCHAR(100),
  meta_description VARCHAR(500),
  meta_keywords VARCHAR(500),
  og_title VARCHAR(100),
  og_description VARCHAR(500),
  og_image VARCHAR(500),
  canonical_url VARCHAR(500),
  robots_meta VARCHAR(50) DEFAULT 'index, follow',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default theme settings
INSERT INTO theme_settings (id) VALUES (1) ON DUPLICATE KEY UPDATE id=id;

-- Insert default navigation
INSERT INTO navigation (id, label, href, display_order, is_active) VALUES
('nav-001', 'Home', '/', 1, true),
('nav-002', 'Projects', '/projects', 2, true),
('nav-003', 'Plots', '/plots', 3, true),
('nav-004', 'About', '/about', 4, true),
('nav-005', 'Gallery', '/gallery', 5, true),
('nav-006', 'Contact', '/contact', 6, true)
ON DUPLICATE KEY UPDATE id=id;

-- Insert default SEO settings
INSERT INTO seo_settings (id, page, meta_title, meta_description, meta_keywords) VALUES
('seo-001', 'home', 'Ravi Developers - Premium Real Estate in Rahim Yar Khan', 'Premium housing societies and plots in Rahim Yar Khan. Punjnad Housing Society, Ravi Garden, and more.', 'ravi developers, rahim yar khan, housing society, plots, real estate'),
('seo-002', 'about', 'About Ravi Developers - Building Trust Since 2005', 'Learn about Ravi Developers journey, mission, and vision. Leading real estate developer in Rahim Yar Khan.', 'about ravi developers, real estate company, rahim yar khan'),
('seo-003', 'projects', 'Our Projects - Ravi Developers', 'Explore our premium housing societies and commercial projects in Rahim Yar Khan.', 'projects, housing societies, punjnad, ravi garden'),
('seo-004', 'plots', 'Available Plots - Ravi Developers', 'Find your perfect plot in our premium housing societies. 3 Marla to 8 Kanal plots available.', 'plots for sale, 3 marla, 5 marla, 10 marla, 1 kanal'),
('seo-005', 'contact', 'Contact Us - Ravi Developers', 'Get in touch with Ravi Developers. Visit our office or contact us for plot bookings and inquiries.', 'contact ravi developers, plot booking, office location'),
('seo-006', 'gallery', 'Project Gallery - Ravi Developers', 'View images of our completed and ongoing projects. Visual tour of Punjnad Housing Society and more.', 'gallery, project images, housing society photos')
ON DUPLICATE KEY UPDATE id=id;

-- Insert default page sections for HOME page
INSERT INTO page_sections (id, page, section_key, title, subtitle, content, images, buttons, display_order, is_active) VALUES
('sec-home-001', 'home', 'hero', 'Premium Living in Rahim Yar Khan', 'Experience luxury living with modern amenities', 
 '{"badge": "Punjab\\''s Most Trusted Developer", "starting_price": "Starting from PKR 1.5 Million"}',
 '["hero-main.jpg"]',
 '[{"text": "View Projects", "link": "/projects", "variant": "primary"}, {"text": "Contact Us", "link": "/contact", "variant": "secondary"}]',
 1, true),
('sec-home-002', 'home', 'stats', 'Our Impact', '',
 '{"items": [{"label": "Active Projects", "value": "5", "icon": "building"}, {"label": "Available Plots", "value": "1200+", "icon": "home"}, {"label": "Sqft Developed", "value": "10M+", "icon": "trending"}, {"label": "Happy Families", "value": "1000+", "icon": "check"}]}',
 '[]', '[]', 2, true),
('sec-home-003', 'home', 'featured_projects', 'Featured Projects', 'Discover our premium housing societies',
 '{"description": "Explore our carefully designed communities that offer modern amenities, prime locations, and excellent investment opportunities."}',
 '[]', '[{"text": "View All Projects", "link": "/projects", "variant": "outline"}]', 3, true),
('sec-home-004', 'home', 'why_choose', 'Why Choose Ravi Developers?', '',
 '{"features": [{"title": "Prime Locations", "desc": "All projects located in developing areas with high growth potential"}, {"title": "Modern Infrastructure", "desc": "Wide roads, parks, schools, and all modern amenities"}, {"title": "Legal Security", "desc": "All projects are LDA approved with clear documentation"}, {"title": "Flexible Payments", "desc": "Easy installment plans to make your dream home affordable"}]}',
 '[]', '[]', 4, true),
('sec-home-005', 'home', 'testimonials', 'What Our Customers Say', 'Trusted by thousands of families',
 '{}', '[]', '[]', 5, true),
('sec-home-006', 'home', 'cta', 'Ready to Find Your Perfect Plot?', 'Book a site visit or contact our sales team',
 '{"description": "Our team is ready to help you find the perfect plot for your dream home or investment. Schedule a free site visit today."}',
 '[]', '[{"text": "Schedule Visit", "link": "/contact", "variant": "primary"}, {"text": "Call Now", "link": "tel:+923001234567", "variant": "secondary"}]', 6, true)
ON DUPLICATE KEY UPDATE id=id;

-- Insert default page sections for ABOUT page
INSERT INTO page_sections (id, page, section_key, title, subtitle, content, images, display_order, is_active) VALUES
('sec-about-001', 'about', 'hero', 'About Ravi Developers', 'Building trust, communities, and dreams in Rahim Yar Khan',
 '{}', '["about-hero.jpg"]', 1, true),
('sec-about-002', 'about', 'story', 'Our Story', '',
 '{"paragraphs": ["Founded in 2005, Ravi Developers has grown from a small property developer to one of the most trusted names in Rahim Yar Khan real estate. Our journey began with a simple mission: to provide quality housing at affordable prices.", "Over the years, we have developed multiple successful housing societies including Punjnad Housing Society, Ravi Garden, and Punjnad Commercial Center. Each project reflects our commitment to quality and customer satisfaction."]}',
 '["story-1.jpg", "story-2.jpg"]', 2, true),
('sec-about-003', 'about', 'mission_vision', 'Mission & Vision', '',
 '{"mission": "To provide affordable, quality housing solutions while maintaining the highest standards of integrity and customer service.", "vision": "To become the most trusted real estate developer in Punjab, known for innovative communities and sustainable development."}',
 '[]', 3, true),
('sec-about-004', 'about', 'values', 'Our Core Values', '',
 '{"values": [{"title": "Integrity", "desc": "We believe in transparent dealings and honest communication"}, {"title": "Quality", "desc": "No compromise on construction standards and materials"}, {"title": "Innovation", "desc": "Modern designs with sustainable practices"}, {"title": "Customer First", "desc": "Your satisfaction is our ultimate goal"}]}',
 '[]', 4, true)
ON DUPLICATE KEY UPDATE id=id;

-- Insert default page sections for CONTACT page
INSERT INTO page_sections (id, page, section_key, title, subtitle, content, images, display_order, is_active) VALUES
('sec-contact-001', 'contact', 'hero', 'Contact Us', 'Get in touch with our team for inquiries and site visits',
 '{}', '["contact-hero.jpg"]', 1, true),
('sec-contact-002', 'contact', 'form', 'Send Us a Message', 'Fill out the form and we will get back to you within 24 hours',
 '{"fields": [{"name": "name", "label": "Full Name", "type": "text", "required": true}, {"name": "email", "label": "Email Address", "type": "email", "required": true}, {"name": "phone", "label": "Phone Number", "type": "tel", "required": true}, {"name": "message", "label": "Message", "type": "textarea", "required": true}]}',
 '[]', 2, true),
('sec-contact-003', 'contact', 'info', 'Visit Our Office', '',
 '{"info_cards": [{"title": "Head Office", "address": "Main Boulevard, Punjnad Housing Society, Rahim Yar Khan", "phone": "+92-300-1234567", "email": "info@ravidevelopers.com", "hours": "Mon-Sat: 9AM - 6PM"}, {"title": "Site Office", "address": "Ravi Garden, Sadiq Road, Rahim Yar Khan", "phone": "+92-300-7654321", "email": "sales@ravidevelopers.com", "hours": "Mon-Sun: 10AM - 8PM"}]}',
 '[]', 3, true)
ON DUPLICATE KEY UPDATE id=id;

-- Insert default page sections for GALLERY page
INSERT INTO page_sections (id, page, section_key, title, subtitle, content, images, display_order, is_active) VALUES
('sec-gallery-001', 'gallery', 'hero', 'Project Gallery', 'Explore our completed and ongoing projects',
 '{}', '["gallery-hero.jpg"]', 1, true),
('sec-gallery-002', 'gallery', 'filters', '', '',
 '{"categories": ["All", "Punjnad Housing", "Ravi Garden", "Commercial Center", "Infrastructure", "Amenities"]}',
 '[]', 2, true)
ON DUPLICATE KEY UPDATE id=id;
