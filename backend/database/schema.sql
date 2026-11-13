-- Thomas Cook Hotel Booking Portal
-- Database Schema for MySQL 8.0+

CREATE DATABASE IF NOT EXISTS hotel_booking_db;
USE hotel_booking_db;

-- 1. Hotels Table
CREATE TABLE IF NOT EXISTS hotels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    amenities JSON NOT NULL,
    room_price_per_night DECIMAL(10, 2) NOT NULL,
    total_rooms INT NOT NULL DEFAULT 5,
    rating DECIMAL(2, 1) DEFAULT 4.5,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_location (location)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_reference VARCHAR(32) NOT NULL UNIQUE,
    hotel_id INT NOT NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_email VARCHAR(150) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INT NOT NULL,
    base_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE RESTRICT,
    INDEX idx_ref_email (booking_reference, guest_email),
    INDEX idx_hotel_dates (hotel_id, status, check_in_date, check_out_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

