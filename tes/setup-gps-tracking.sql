-- GPS Location Tracking Setup Script
-- Run this script to set up the location tracking feature

-- Use your database
USE tes_tour;

-- Create location_tracking table
CREATE TABLE IF NOT EXISTS location_tracking (
  location_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  user_type ENUM('customer', 'tourguide', 'driver') NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  accuracy DECIMAL(10, 2) DEFAULT NULL,
  altitude DECIMAL(10, 2) DEFAULT NULL,
  speed DECIMAL(10, 2) DEFAULT NULL,
  heading DECIMAL(10, 2) DEFAULT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_booking_id (booking_id),
  INDEX idx_user_id (user_id),
  INDEX idx_timestamp (timestamp),
  INDEX idx_booking_user_timestamp (booking_id, user_id, timestamp DESC),
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Verify table creation
SELECT 'Location tracking table created successfully!' AS status;
DESCRIBE location_tracking;

-- Show indexes
SHOW INDEXES FROM location_tracking;

-- Optional: Create a sample location entry (for testing)
-- Uncomment the following lines if you want to insert test data
/*
INSERT INTO location_tracking 
  (booking_id, user_id, user_type, latitude, longitude, accuracy, timestamp)
VALUES 
  (1, 1, 'customer', 9.0320, 38.7469, 10.5, NOW()),
  (1, 2, 'tourguide', 9.0325, 38.7475, 8.2, NOW());

SELECT 'Sample location data inserted!' AS status;
*/

-- Create a stored procedure for cleanup (optional)
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS cleanup_old_locations()
BEGIN
  DELETE FROM location_tracking 
  WHERE timestamp < DATE_SUB(NOW(), INTERVAL 7 DAY);
  
  SELECT ROW_COUNT() AS 'Deleted Records';
END //

DELIMITER ;

SELECT 'Cleanup procedure created. Run CALL cleanup_old_locations(); to clean old data.' AS info;

-- Show final status
SELECT 
  COUNT(*) as total_records,
  COUNT(DISTINCT booking_id) as unique_bookings,
  COUNT(DISTINCT user_id) as unique_users
FROM location_tracking;

SELECT 'GPS Tracking setup complete!' AS status;
