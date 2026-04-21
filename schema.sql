-- Ravi Developers Database Schema
-- Run this SQL file to create all tables

CREATE DATABASE IF NOT EXISTS ravi_developers CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ravi_developers;

-- Users table (for admin login)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    location VARCHAR(255),
    total_area VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Active',
    images JSON,
    features JSON,
    launch_date DATE,
    completion_date DATE,
    starting_price DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Plots table
CREATE TABLE IF NOT EXISTS plots (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    plot_number VARCHAR(50) NOT NULL,
    size VARCHAR(50),
    type VARCHAR(50),
    price DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Available',
    area VARCHAR(50),
    facing VARCHAR(50),
    category VARCHAR(50),
    is_corner BOOLEAN DEFAULT FALSE,
    map_block VARCHAR(50),
    map_row INT,
    map_col INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    message TEXT,
    project_id VARCHAR(36),
    plot_id VARCHAR(36),
    status VARCHAR(50) DEFAULT 'New',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
    FOREIGN KEY (plot_id) REFERENCES plots(id) ON DELETE SET NULL
);

-- Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id VARCHAR(36) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    customer_image VARCHAR(500),
    testimonial TEXT NOT NULL,
    rating INT DEFAULT 5,
    project_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

-- Site Settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
-- Change this password in production!
INSERT INTO users (id, email, password, name, role) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@ravi.com', '$2a$10$YourHashedPasswordHere', 'Admin User', 'admin')
ON DUPLICATE KEY UPDATE email = email;

-- Insert default site settings
INSERT INTO site_settings (id, setting_key, value) VALUES
('660e8400-e29b-41d4-a716-446655440001', 'siteName', 'Ravi Developers'),
('660e8400-e29b-41d4-a716-446655440002', 'siteDescription', 'Premium Real Estate Solutions'),
('660e8400-e29b-41d4-a716-446655440003', 'contactEmail', 'contact@ravi.com'),
('660e8400-e29b-41d4-a716-446655440004', 'contactPhone', '+92-XXX-XXXXXXX'),
('660e8400-e29b-41d4-a716-446655440005', 'whatsappNumber', '+92-XXX-XXXXXXX')
ON DUPLICATE KEY UPDATE setting_key = setting_key;
