-- =====================================================
-- RATINGS SYSTEM SQL SCHEMA - FIXED VERSION
-- Compatible with MySQL 5.7 and 8.0+
-- =====================================================

-- Step 1: Drop existing table if it has issues
DROP TABLE IF EXISTS `ratings`;

-- Step 2: Create ratings table (without CHECK constraints for compatibility)
CREATE TABLE `ratings` (
  `rating_id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_id` INT NOT NULL,
  `customer_id` INT NOT NULL,
  `tour_guide_id` INT NULL,
  `driver_id` INT NULL,
  `rating_tourguide` DECIMAL(2,1) NULL,
  `rating_driver` DECIMAL(2,1) NULL,
  `review_tourguide` TEXT NULL,
  `review_driver` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  CONSTRAINT `fk_ratings_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_customer` FOREIGN KEY (`customer_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_tourguide` FOREIGN KEY (`tour_guide_id`) REFERENCES `users`(`user_id`) ON DELETE SET NULL,
  CONSTRAINT `fk_ratings_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE SET NULL,
  
  -- Unique constraint: one rating per booking
  UNIQUE KEY `unique_booking_rating` (`booking_id`),
  
  -- Indexes for better query performance
  KEY `idx_ratings_booking` (`booking_id`),
  KEY `idx_ratings_customer` (`customer_id`),
  KEY `idx_ratings_tourguide` (`tour_guide_id`),
  KEY `idx_ratings_driver` (`driver_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 3: Add rating columns to tourguides table
-- Check if column exists first
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'tourguides' 
  AND COLUMN_NAME = 'rating';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `tourguides` ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00',
  'SELECT "Column rating already exists in tourguides" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add total_ratings column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'tourguides' 
  AND COLUMN_NAME = 'total_ratings';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `tourguides` ADD COLUMN `total_ratings` INT DEFAULT 0',
  'SELECT "Column total_ratings already exists in tourguides" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 4: Add rating columns to drivers table
-- Check if column exists first
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'drivers' 
  AND COLUMN_NAME = 'rating';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `drivers` ADD COLUMN `rating` DECIMAL(3,2) DEFAULT 0.00',
  'SELECT "Column rating already exists in drivers" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add total_ratings column
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'drivers' 
  AND COLUMN_NAME = 'total_ratings';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `drivers` ADD COLUMN `total_ratings` INT DEFAULT 0',
  'SELECT "Column total_ratings already exists in drivers" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 5: Create additional indexes
CREATE INDEX IF NOT EXISTS `idx_tourguides_rating` ON `tourguides`(`rating` DESC);
CREATE INDEX IF NOT EXISTS `idx_drivers_rating` ON `drivers`(`rating` DESC);

-- Step 6: Verify table structure
SELECT 'Ratings table structure:' AS status;
DESCRIBE ratings;

SELECT 'Tourguides rating columns:' AS status;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'tourguides' 
  AND COLUMN_NAME IN ('rating', 'total_ratings');

SELECT 'Drivers rating columns:' AS status;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'drivers' 
  AND COLUMN_NAME IN ('rating', 'total_ratings');

SELECT '✅ Ratings system setup complete!' AS status;
