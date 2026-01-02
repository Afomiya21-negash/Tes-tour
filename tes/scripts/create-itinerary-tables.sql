-- Create itinerary management tables

-- Table for storing default tour itineraries
CREATE TABLE `itinerary` (
  `itinerary_id` int(11) NOT NULL AUTO_INCREMENT,
  `tour_id` int(11) NOT NULL,
  `day_number` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `overnight_location` varchar(100) DEFAULT NULL,
  `activities` text DEFAULT NULL,
  `meals_included` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`itinerary_id`),
  KEY `tour_id` (`tour_id`),
  CONSTRAINT `itinerary_ibfk_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`tour_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for storing customer customized itineraries
CREATE TABLE `custom_itinerary` (
  `custom_itinerary_id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `day_number` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `overnight_location` varchar(100) DEFAULT NULL,
  `activities` text DEFAULT NULL,
  `meals_included` varchar(100) DEFAULT NULL,
  `special_requests` text DEFAULT NULL,
  `is_approved` tinyint(1) DEFAULT 0,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`custom_itinerary_id`),
  KEY `booking_id` (`booking_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `custom_itinerary_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `custom_itinerary_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for tracking itinerary modification requests
CREATE TABLE `itinerary_requests` (
  `request_id` int(11) NOT NULL AUTO_INCREMENT,
  `booking_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `request_type` enum('modification','addition','removal') NOT NULL,
  `day_number` int(11) DEFAULT NULL,
  `requested_changes` text NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `admin_response` text DEFAULT NULL,
  `processed_by` int(11) DEFAULT NULL,
  `processed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`request_id`),
  KEY `booking_id` (`booking_id`),
  KEY `customer_id` (`customer_id`),
  KEY `processed_by` (`processed_by`),
  CONSTRAINT `itinerary_requests_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `itinerary_requests_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `itinerary_requests_ibfk_3` FOREIGN KEY (`processed_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample default itineraries for existing tours
INSERT INTO `itinerary` (`tour_id`, `day_number`, `title`, `description`, `location`, `overnight_location`, `activities`, `meals_included`) VALUES
-- Historical Lalibela Tour (tour_id = 1)
(1, 1, 'Arrival in Lalibela', 'Arrive in Lalibela and check into hotel. Evening orientation and welcome dinner.', 'Lalibela', 'Lalibela', 'Airport transfer, hotel check-in, welcome dinner', 'Dinner'),
(1, 2, 'Rock-Hewn Churches Tour', 'Full day exploring the famous rock-hewn churches of Lalibela, including St. George Church.', 'Lalibela', 'Lalibela', 'Church visits, guided tour, photography', 'Breakfast, Lunch, Dinner'),
(1, 3, 'Cultural Experience & Departure', 'Morning visit to local market and traditional coffee ceremony. Afternoon departure.', 'Lalibela', '', 'Market visit, coffee ceremony, departure transfer', 'Breakfast, Lunch'),

-- Simien Mountains Trek (tour_id = 2)
(2, 1, 'Arrival in Gondar', 'Arrive in Gondar, city tour and preparation for trek.', 'Gondar', 'Gondar', 'City tour, equipment check, briefing', 'Dinner'),
(2, 2, 'Gondar to Sankaber', 'Drive to Simien Mountains National Park and trek to Sankaber camp.', 'Simien Mountains', 'Sankaber Camp', 'Trekking, wildlife viewing', 'Breakfast, Lunch, Dinner'),
(2, 3, 'Sankaber to Geech', 'Trek from Sankaber to Geech camp with spectacular mountain views.', 'Simien Mountains', 'Geech Camp', 'Trekking, mountain views, wildlife', 'Breakfast, Lunch, Dinner'),
(2, 4, 'Geech to Imet Gogo', 'Day hike to Imet Gogo viewpoint and return to Geech.', 'Simien Mountains', 'Geech Camp', 'Day hiking, viewpoint visit', 'Breakfast, Lunch, Dinner'),
(2, 5, 'Geech to Chenek', 'Trek to Chenek camp with chances to see Gelada monkeys.', 'Simien Mountains', 'Chenek Camp', 'Trekking, wildlife viewing', 'Breakfast, Lunch, Dinner'),
(2, 6, 'Chenek to Gondar', 'Morning wildlife viewing and return to Gondar.', 'Gondar', 'Gondar', 'Wildlife viewing, return journey', 'Breakfast, Lunch, Dinner'),
(2, 7, 'Departure', 'Transfer to airport for departure.', 'Gondar', '', 'Airport transfer', 'Breakfast'),

-- Danakil Depression Tour (tour_id = 3)
(3, 1, 'Arrival in Mekelle', 'Arrive in Mekelle and prepare for Danakil expedition.', 'Mekelle', 'Mekelle', 'Arrival, equipment preparation', 'Dinner'),
(3, 2, 'Mekelle to Erta Ale', 'Drive to Erta Ale volcano base and evening hike to crater.', 'Danakil Depression', 'Erta Ale Base', 'Volcano hike, crater viewing', 'Breakfast, Lunch, Dinner'),
(3, 3, 'Erta Ale to Dallol', 'Early morning descent and drive to Dallol salt formations.', 'Danakil Depression', 'Dallol Area', 'Salt formations, hot springs', 'Breakfast, Lunch, Dinner'),
(3, 4, 'Dallol Exploration', 'Full day exploring Dallol salt formations and sulfur springs.', 'Danakil Depression', 'Dallol Area', 'Geological exploration, photography', 'Breakfast, Lunch, Dinner'),
(3, 5, 'Return to Mekelle', 'Return journey to Mekelle and departure.', 'Mekelle', '', 'Return journey, departure', 'Breakfast, Lunch');
