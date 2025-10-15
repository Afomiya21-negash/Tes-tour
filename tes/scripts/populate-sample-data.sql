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
