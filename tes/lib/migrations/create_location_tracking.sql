-- Create location_tracking table for real-time GPS tracking
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
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create index for efficient querying of latest locations
CREATE INDEX idx_booking_user_timestamp ON location_tracking(booking_id, user_id, timestamp DESC);
