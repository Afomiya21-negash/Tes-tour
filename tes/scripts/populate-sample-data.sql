-- Sample data for testing the booking system

-- Insert sample tours
INSERT INTO tours (tour_id, name, description, destination, duration_days, price, availability) VALUES
(1, 'Historical Lalibela Tour', 'Explore the ancient rock-hewn churches of Lalibela, a UNESCO World Heritage site.', 'Lalibela', 3, 450.00, 1),
(2, 'Simien Mountains Trek', 'Adventure trekking in the stunning Simien Mountains National Park.', 'Simien Mountains', 7, 850.00, 1),
(3, 'Danakil Depression Tour', 'Visit one of the hottest and lowest places on Earth with unique geological formations.', 'Danakil Depression', 5, 650.00, 1),
(4, '7 Days Simien Mountains', 'Extended trekking experience in the Simien Mountains with wildlife viewing.', 'Simien Mountains', 7, 950.00, 1),
(5, '12 Days Historic with Simien', 'Comprehensive tour combining historical sites and mountain trekking.', 'Multiple Destinations', 12, 1850.00, 1),
(6, 'Half Day Trip', 'Quick city tour of Addis Ababa and surrounding areas.', 'Addis Ababa', 1, 75.00, 1);

-- Insert sample vehicles
INSERT INTO vehicles (vehicle_id, make, model, year, license_plate, capacity, daily_rate, status) VALUES
(1, 'Toyota', 'Hilux', 2020, 'AA-123-456', 4, 150.00, 'available'),
(2, 'Toyota', 'Land Cruiser', 2019, 'AA-234-567', 7, 200.00, 'available'),
(3, 'Toyota', 'Coaster', 2021, 'AA-345-678', 15, 300.00, 'available'),
(4, 'Nissan', 'Patrol', 2020, 'AA-456-789', 6, 180.00, 'available'),
(5, 'Mitsubishi', 'Pajero', 2018, 'AA-567-890', 5, 160.00, 'available'),
(6, 'Isuzu', 'D-Max', 2019, 'AA-678-901', 4, 140.00, 'available');

-- Insert sample drivers (first create users for them)
INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, phone_number, role) VALUES
(100, 'driver1', 'driver1@testour.com', '$2b$10$example_hash_1', 'Alemayehu', 'Tadesse', '+251911123456', 'driver'),
(101, 'driver2', 'driver2@testour.com', '$2b$10$example_hash_2', 'Bekele', 'Mekonnen', '+251911234567', 'driver'),
(102, 'driver3', 'driver3@testour.com', '$2b$10$example_hash_3', 'Chaltu', 'Girma', '+251911345678', 'driver');

-- Insert driver records
INSERT INTO drivers (driver_id, license_number, vehicle_type, rating) VALUES
(100, 'DL-001-2020', 'SUV', 4.5),
(101, 'DL-002-2019', 'Truck', 4.8),
(102, 'DL-003-2021', 'Van', 4.2);

-- Insert employee records for drivers
INSERT INTO employees (employee_id, position, department, hire_date) VALUES
(100, 'Driver', 'Transport', '2020-01-15'),
(101, 'Driver', 'Transport', '2019-06-20'),
(102, 'Driver', 'Transport', '2021-03-10');

-- Assign drivers to vehicles
UPDATE vehicles SET driver_id = 100 WHERE vehicle_id = 1;
UPDATE vehicles SET driver_id = 100 WHERE vehicle_id = 2;
UPDATE vehicles SET driver_id = 101 WHERE vehicle_id = 3;
UPDATE vehicles SET driver_id = 101 WHERE vehicle_id = 4;
UPDATE vehicles SET driver_id = 102 WHERE vehicle_id = 5;
UPDATE vehicles SET driver_id = 102 WHERE vehicle_id = 6;

-- Insert sample tour guides
INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, phone_number, role) VALUES
(200, 'guide1', 'guide1@testour.com', '$2b$10$example_hash_4', 'Yedidiya', 'Birhanu', '+251911456789', 'tourguide'),
(201, 'guide2', 'guide2@testour.com', '$2b$10$example_hash_5', 'Meron', 'Haile', '+251911567890', 'tourguide');

-- Insert tour guide records
INSERT INTO tourguides (tour_guide_id, license_number, experience_years, specialization, rating) VALUES
(200, 'TG-001-2018', 6, 'Historical Sites', 4.7),
(201, 'TG-002-2019', 5, 'Mountain Trekking', 4.9);

-- Insert employee records for tour guides
INSERT INTO employees (employee_id, position, department, hire_date) VALUES
(200, 'Tour Guide', 'Guides', '2018-04-12'),
(201, 'Tour Guide', 'Guides', '2019-08-25');

-- Assign tour guides to tours
UPDATE tours SET tour_guide_id = 200 WHERE tour_id IN (1, 5, 6);
UPDATE tours SET tour_guide_id = 201 WHERE tour_id IN (2, 3, 4);

-- Insert sample customers for bookings
INSERT INTO users (user_id, username, email, password_hash, first_name, last_name, phone_number, role) VALUES
(300, 'customer1', 'john.doe@email.com', '$2b$10$example_hash_6', 'John', 'Doe', '+251911789012', 'customer'),
(301, 'customer2', 'jane.smith@email.com', '$2b$10$example_hash_7', 'Jane', 'Smith', '+251911890123', 'customer'),
(302, 'customer3', 'mike.wilson@email.com', '$2b$10$example_hash_8', 'Mike', 'Wilson', '+251911901234', 'customer');

-- Insert sample bookings
INSERT INTO bookings (booking_id, customer_id, tour_id, vehicle_id, driver_id, tour_guide_id, start_date, end_date, total_price, booking_date, status, special_requests, number_of_people) VALUES
(1, 300, 1, 1, 100, 200, '2024-02-15', '2024-02-17', 450.00, '2024-01-15 09:30:00', 'confirmed', 'Vegetarian meals preferred', 2),
(2, 301, 2, 2, 101, 201, '2024-02-20', '2024-02-26', 850.00, '2024-01-20 14:15:00', 'confirmed', 'Need hiking boots size 42', 1),
(3, 302, 3, 3, 102, 200, '2024-03-01', '2024-03-04', 650.00, '2024-02-01 11:45:00', 'pending', 'First time visitor to Ethiopia', 3),
(4, 300, 4, 1, 100, 201, '2024-03-10', '2024-03-14', 750.00, '2024-02-10 16:20:00', 'confirmed', 'Photography equipment transport needed', 2),
(5, 301, 5, 2, 101, 200, '2024-03-20', '2024-03-25', 800.00, '2024-02-15 13:10:00', 'pending', 'Wildlife photography focus', 1);

-- Insert sample payments for bookings
INSERT INTO payments (payment_id, booking_id, amount, payment_method, status, payment_date) VALUES
(1, 1, 450.00, 'bank_transfer', 'completed', '2024-01-15 10:00:00'),
(2, 2, 850.00, 'credit_card', 'completed', '2024-01-20 14:30:00'),
(3, 3, 650.00, 'cash', 'pending', NULL),
(4, 4, 750.00, 'bank_transfer', 'completed', '2024-02-10 17:00:00'),
(5, 5, 800.00, 'mobile_money', 'pending', NULL);

-- Insert sample ratings
INSERT INTO ratings (rating_id, booking_id, customer_id, rated_user_id, rating_type, rating, comment, created_at) VALUES
(1, 1, 300, 200, 'tourguide', 5, 'Excellent guide! Very knowledgeable about Ethiopian history.', '2024-01-15 10:30:00'),
(2, 1, 300, 100, 'driver', 4, 'Safe driver, comfortable journey.', '2024-01-15 10:35:00'),
(3, 2, 301, 201, 'tourguide', 5, 'Amazing trekking experience! Highly recommended.', '2024-01-20 14:20:00'),
(4, 2, 301, 101, 'driver', 5, 'Professional and friendly driver.', '2024-01-20 14:25:00'),
(5, 4, 300, 201, 'tourguide', 4, 'Great cultural insights and very patient.', '2024-02-12 09:15:00'),
(6, 4, 300, 100, 'driver', 4, 'Reliable and punctual driver.', '2024-02-12 09:20:00');
