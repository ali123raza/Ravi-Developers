INSERT INTO site_settings (`key`, value) VALUES
('siteName', 'Ravi Developers'),
('siteDescription', 'Premium Real Estate Solutions'),
('contactEmail', 'contact@ravi.com'),
('contactPhone', '+92-300-9659017'),
('whatsappNumber', '+92-300-9659017'),
('hero_content', '{"badge": "TMA Approved Projects", "title": "Ravi Developers - Rahim Yar Khan\'s Premier Real Estate", "subtitle": "Premium residential & commercial plots in TMA approved housing societies. 4-year easy installment plans.", "location": "Shahbaz Pur Road, Rahim Yar Khan", "starting_price": "Plots starting from PKR 3.75 Lac per Marla", "cta_primary": "View Projects", "cta_secondary": "Contact Us", "hero_image": ""}'),
('contact_info', '{"address": "Shahbaz Pur Road, Near Grid Station, Rahim Yar Khan, Pakistan", "phone1": "+92 300-9659017", "phone2": "+92 333-XXXXXXX", "email": "info@ravidevelopers.com", "whatsapp": "+92 300-9659017", "hours_weekday": "Mon - Sat: 9:00 AM - 6:00 PM", "hours_weekend": "Sunday: Closed"}'),
('company_stats', '{"sqft_developed": "10M+", "happy_families": "1000+", "active_projects": "4", "approval": "TMA Approved"}'),
('social_links', '{"facebook": "https://facebook.com/ravidevelopers", "instagram": "https://instagram.com/ravidevelopers"}'),
('footer_tagline', '{"text": "Ravi Developers - Building dreams in Rahim Yar Khan since 2010. TMA approved housing societies with modern amenities."}')
ON DUPLICATE KEY UPDATE value = VALUES(value);
