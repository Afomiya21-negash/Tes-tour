-- Create rating system tables

-- Table for storing customer ratings and reviews
CREATE TABLE `ratings` (
  `rating_id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `rated_user_id` int(11) NOT NULL,
  `rating_type` enum('tourguide','driver') NOT NULL,
  `rating` int(1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`rating_id`),
  UNIQUE KEY `unique_booking_rating` (`booking_id`, `rated_user_id`, `rating_type`),
  KEY `booking_id` (`booking_id`),
  KEY `customer_id` (`customer_id`),
  KEY `rated_user_id` (`rated_user_id`),
  CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`rated_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample ratings data
INSERT INTO `ratings` (`booking_id`, `customer_id`, `rated_user_id`, `rating_type`, `rating`, `comment`) VALUES
-- Assuming we have some bookings and users in the system
-- Tour guide ratings
(1, 1, 2, 'tourguide', 5, 'Excellent tour guide! Very knowledgeable about Ethiopian history and culture.'),
(1, 1, 3, 'driver', 4, 'Safe and professional driver. Arrived on time.'),
(2, 2, 2, 'tourguide', 4, 'Good guide, but could be more engaging with the group.'),
(2, 2, 4, 'driver', 5, 'Outstanding driver! Very careful on mountain roads.'),
(3, 3, 5, 'tourguide', 5, 'Amazing experience! The guide made the tour unforgettable.'),
(3, 3, 3, 'driver', 4, 'Good driving skills, comfortable journey.');

-- Add driver_id column to bookings table if it doesn't exist
-- ALTER TABLE `bookings` ADD COLUMN `driver_id` int(11) DEFAULT NULL AFTER `tour_guide_id`;
-- ALTER TABLE `bookings` ADD CONSTRAINT `bookings_driver_fk` FOREIGN KEY (`driver_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

-- Add number_of_people column to bookings table if it doesn't exist  
-- ALTER TABLE `bookings` ADD COLUMN `number_of_people` int(11) DEFAULT 1 AFTER `total_price`;

-- Add special_requests column to bookings table if it doesn't exist
-- ALTER TABLE `bookings` ADD COLUMN `special_requests` text DEFAULT NULL AFTER `number_of_people`;
