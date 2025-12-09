-- ============================================
-- CHANGE REQUESTS SYSTEM
-- Allows customers to request tour guide/driver changes
-- Admin can review and approve these requests
-- ============================================

-- Drop table if exists (for clean reinstall)
DROP TABLE IF EXISTS change_requests;

-- Create change_requests table
CREATE TABLE change_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  user_id INT NOT NULL,
  request_type ENUM('tour_guide', 'driver', 'both') NOT NULL,
  
  -- Current assignments (at time of request)
  current_tour_guide_id INT DEFAULT NULL,
  current_driver_id INT DEFAULT NULL,
  
  -- New assignments (after admin approval)
  new_tour_guide_id INT DEFAULT NULL,
  new_driver_id INT DEFAULT NULL,
  
  -- Request details
  reason TEXT DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL DEFAULT NULL,
  processed_by INT DEFAULT NULL,
  
  -- Foreign keys
  CONSTRAINT fk_change_request_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  CONSTRAINT fk_change_request_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_change_request_current_guide FOREIGN KEY (current_tour_guide_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_change_request_current_driver FOREIGN KEY (current_driver_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_change_request_new_guide FOREIGN KEY (new_tour_guide_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_change_request_new_driver FOREIGN KEY (new_driver_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_change_request_processor FOREIGN KEY (processed_by) REFERENCES users(user_id) ON DELETE SET NULL,
  
  INDEX idx_booking_id (booking_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check table creation
SHOW TABLES LIKE 'change_requests';

-- Check table structure
DESCRIBE change_requests;

-- Check indexes
SHOW INDEX FROM change_requests;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Note: Uncomment only if you want to add test data
/*
INSERT INTO change_requests (booking_id, user_id, request_type, current_tour_guide_id, reason, status)
VALUES 
  (1, 1, 'tour_guide', 5, 'Tour guide was not knowledgeable about the area', 'pending'),
  (2, 2, 'driver', 3, 'Driver was late to pick up location', 'pending');
*/
