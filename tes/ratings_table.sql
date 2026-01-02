-- =====================================================
-- RATINGS SYSTEM SQL SCHEMA
-- Compatible with MySQL 5.7 and 8.0+
-- Run this script to create the ratings table and update
-- tourguides and drivers tables with rating columns
-- =====================================================

-- Drop existing ratings table if it has issues
DROP TABLE IF EXISTS `ratings`;

-- Create ratings table (without CHECK constraints for MySQL 5.7 compatibility)
CREATE TABLE `ratings` (
  `rating_id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  `tour_guide_id` INT NULL,
  `driver_id` INT NULL,
  `rating_tourguide` DECIMAL(2,1) NULL COMMENT 'Rating 0.0 to 5.0',
  `rating_driver` DECIMAL(2,1) NULL COMMENT 'Rating 0.0 to 5.0',
  `review_tourguide` TEXT NULL,
  `review_driver` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint: one rating per booking
  UNIQUE KEY `unique_booking_rating` (`booking_id`),
  
  -- Indexes
  KEY `idx_ratings_booking` (`booking_id`),
  KEY `idx_ratings_customer` (`customer_id`),
  KEY `idx_ratings_tourguide` (`tour_guide_id`),
  KEY `idx_ratings_driver` (`driver_id`),
  
  -- Foreign key constraints
  CONSTRAINT `fk_ratings_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_customer` FOREIGN KEY (`customer_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_tourguide` FOREIGN KEY (`tour_guide_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ratings_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add rating column to tourguides table
ALTER TABLE `tourguides` 
ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Average rating 0.00 to 5.00';

-- Add total_ratings column to track number of ratings
ALTER TABLE `tourguides` 
ADD COLUMN `total_ratings` INT DEFAULT 0;

-- Add rating column to drivers table
ALTER TABLE `drivers` 
ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00 COMMENT 'Average rating 0.00 to 5.00';

-- Add total_ratings column to track number of ratings
ALTER TABLE `drivers` 
ADD COLUMN `total_ratings` INT DEFAULT 0;

-- Create additional indexes for sorting by rating
CREATE INDEX `idx_tourguides_rating` ON `tourguides`(`rating` DESC);
CREATE INDEX `idx_drivers_rating` ON `drivers`(`rating` DESC);

-- =====================================================
-- TABLE STRUCTURE EXPLANATION
-- =====================================================
-- ratings table:
--   - rating_id: Unique identifier for each rating
--   - booking_id: Links to the booking being rated (one rating per booking)
--   - customer_id: The customer who submitted the rating
--   - tour_guide_id: The tour guide being rated (nullable if no tour guide)
--   - driver_id: The driver being rated (nullable if no driver)
--   - rating_tourguide: Star rating for tour guide (0.0 to 5.0)
--   - rating_driver: Star rating for driver (0.0 to 5.0)
--   - review_tourguide: Optional text review for tour guide
--   - review_driver: Optional text review for driver
--   - created_at: Timestamp when rating was submitted
--
-- tourguides table additions:
--   - rating: Average rating (calculated from all ratings)
--   - total_ratings: Total number of ratings received
--
-- drivers table additions:
--   - rating: Average rating (calculated from all ratings)
--   - total_ratings: Total number of ratings received
-- =====================================================
