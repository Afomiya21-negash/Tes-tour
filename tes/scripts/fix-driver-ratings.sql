-- Fix missing driver entries and ratings
-- Add missing drivers to the drivers table

INSERT IGNORE INTO drivers (driver_id, license_number, vehicle_type, rating) VALUES
(6, 'DL12350', 'SUV', 4.3),
(7, 'DL12351', 'Sedan', 4.7),
(8, 'DL12352', 'Van', 4.4);

-- Update existing driver ratings to be more realistic
UPDATE drivers SET rating = 4.8 WHERE driver_id = 1;
UPDATE drivers SET rating = 4.6 WHERE driver_id = 2;
UPDATE drivers SET rating = 4.7 WHERE driver_id = 3;
UPDATE drivers SET rating = 4.5 WHERE driver_id = 4;
UPDATE drivers SET rating = 4.9 WHERE driver_id = 5;
