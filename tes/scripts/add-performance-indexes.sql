-- Performance Optimization: Database Indexes
-- Run this script to add indexes for better query performance
-- Execute this in your MySQL/phpMyAdmin

-- Index on tours table for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_tours_availability ON tours(availability);
CREATE INDEX IF NOT EXISTS idx_tours_tour_guide_id ON tours(tour_guide_id);
CREATE INDEX IF NOT EXISTS idx_tours_destination ON tours(destination);

-- Index on bookings table for user queries and date ranges
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON bookings(tour_id);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_id ON bookings(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON bookings(booking_date);

-- Index on vehicles table for availability queries
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_id ON vehicles(driver_id);

-- Index on users table for login queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Index on payments table for booking lookups
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Index on promotion table for tour promotions
CREATE INDEX IF NOT EXISTS idx_promotion_tour_id ON promotion(tour_id);
CREATE INDEX IF NOT EXISTS idx_promotion_date ON promotion(date);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tours_availability_guide ON tours(availability, tour_guide_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_status_driver ON vehicles(status, driver_id);

-- Show index creation results
SELECT 'Indexes created successfully!' as Status;
