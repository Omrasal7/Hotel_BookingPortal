-- Thomas Cook Hotel Booking Portal
-- Sample Data Seeding for MySQL

USE hotel_booking_db;

-- Clear previous sample data for fresh run
DELETE FROM bookings;
DELETE FROM hotels;
ALTER TABLE hotels AUTO_INCREMENT = 1;
ALTER TABLE bookings AUTO_INCREMENT = 1;

INSERT INTO hotels (id, name, location, description, amenities, room_price_per_night, total_rooms, rating, image_url)
VALUES
(
    1,
    'The Grand Heritage Palace',
    'Jaipur',
    'A majestic royal palace experience in the Pink City featuring traditional Rajasthani architecture, lush Mughal gardens, and authentic fine-dining restaurants.',
    '["Free High-Speed WiFi", "Heritage Swimming Pool", "Ayurvedic Royal Spa", "Complimentary Breakfast", "24/7 Room Service", "Airport Shuttle"]',
    4500.00,
    5,
    4.9,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'
),
(
    2,
    'Azure Bay Beach Resort & Spa',
    'Goa',
    'Beachfront luxury resort overlooking pristine Arabian Sea sands in Calangute. Enjoy private sunbeds, oceanview infinity pools, and vibrant coastal cuisine.',
    '["Private Beach Access", "Infinity Pool", "Free Buffet Breakfast", "Beachside Bar", "Fitness Center", "High-Speed WiFi"]',
    3800.00,
    6,
    4.8,
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80'
),
(
    3,
    'The Regal Skyline Suites',
    'Mumbai',
    'Sophisticated high-rise suites in the heart of Mumbai business district. Perfect for discerning corporate travelers and luxury weekend staycations.',
    '["Panoramic City View", "Rooftop Lounge", "High-Speed Business WiFi", "Executive Meeting Rooms", "24/7 Concierge", "Valet Parking"]',
    5200.00,
    4,
    4.7,
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
),
(
    4,
    'Alpine Mist Mountain Resort',
    'Manali',
    'Nestled amidst snow-capped Himalayan peaks and pine forests. Cozy cedar-wood rooms with private fireplaces, hot springs, and guided mountain treks.',
    '["Snow Mountain View", "Heated Indoor Pool", "Campfire & Barbecue", "Free WiFi", "Trekking Desk", "Multi-Cuisine Restaurant"]',
    3200.00,
    5,
    4.6,
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80'
),
(
    5,
    'Emerald Tea Valley Retreat',
    'Munnar',
    'Idyllic eco-luxury resort surrounded by rolling green tea plantations and misty valleys. Wake up to bird songs, spice plantation walks, and pure serenity.',
    '["Tea Garden Trails", "Organic Restaurant", "Balcony with Valley View", "Spa & Wellness", "Free WiFi", "Yoga Sessions"]',
    2900.00,
    5,
    4.7,
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'
),
(
    6,
    'Silicon Valley Executive Hotel',
    'Bengaluru',
    'Contemporary tech-hub hotel located close to Electronic City and Indiranagar. Ergonomic workspaces, fast fiber internet, and artisan coffee bar.',
    '["Ultra-Fast Fiber WiFi", "Ergonomic Workstation", "Rooftop Pool", "Cocktail Bar", "Soundproof Rooms", "Fitness Studio"]',
    3400.00,
    4,
    4.5,
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80'
);

