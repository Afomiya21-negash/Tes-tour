-- Itinerary Customization System
-- This script creates tables for customer itinerary customization and tour guide notifications

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS itinerary_notifications;
DROP TABLE IF EXISTS custom_itineraries;

-- Create custom_itineraries table
CREATE TABLE IF NOT EXISTS custom_itineraries (
  itinerary_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  tour_id INT NOT NULL,
  booking_id INT NOT NULL,
  description TEXT NOT NULL,
  is_customized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (tour_id) REFERENCES tours(tour_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  
  -- Indexes for performance
  INDEX idx_customer (customer_id),
  INDEX idx_tour (tour_id),
  INDEX idx_booking (booking_id),
  INDEX idx_customized (is_customized),
  INDEX idx_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Create itinerary_notifications table for tour guide notifications
CREATE TABLE IF NOT EXISTS itinerary_notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  itinerary_id INT NOT NULL,
  tour_guide_id INT NOT NULL,
  booking_id INT NOT NULL,
  customer_id INT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (itinerary_id) REFERENCES custom_itineraries(itinerary_id) ON DELETE CASCADE,
  FOREIGN KEY (tour_guide_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- Indexes
  INDEX idx_tour_guide (tour_guide_id),
  INDEX idx_booking (booking_id),
  INDEX idx_read_status (is_read),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Verify table creation
SELECT 'Custom itineraries table created successfully!' AS status;
DESCRIBE custom_itineraries;

SELECT 'Itinerary notifications table created successfully!' AS status;
DESCRIBE itinerary_notifications;

-- Show indexes
SHOW INDEXES FROM custom_itineraries;
SHOW INDEXES FROM itinerary_notifications;

-- Create a stored procedure to get unread notification count for tour guide
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS get_unread_itinerary_notifications(IN guide_id INT)
BEGIN
  SELECT COUNT(*) as unread_count
  FROM itinerary_notifications
  WHERE tour_guide_id = guide_id AND is_read = FALSE;
END //

DELIMITER ;

SELECT 'Stored procedure created. Use: CALL get_unread_itinerary_notifications(tour_guide_id);' AS info;

-- Show final status
SELECT 
  (SELECT COUNT(*) FROM custom_itineraries) as total_itineraries,
  (SELECT COUNT(*) FROM custom_itineraries WHERE is_customized = TRUE) as customized_itineraries,
  (SELECT COUNT(*) FROM itinerary_notifications) as total_notifications,
  (SELECT COUNT(*) FROM itinerary_notifications WHERE is_read = FALSE) as unread_notifications;

SELECT 'Itinerary Customization System setup complete!' AS status;
