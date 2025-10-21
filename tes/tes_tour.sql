-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 21, 2025 at 03:48 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tes_tour`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `admin_id` int(11) NOT NULL,
  `admin_level` varchar(50) NOT NULL,
  `hire_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `tour_id` int(11) DEFAULT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `booking_date` datetime DEFAULT current_timestamp(),
  `status` varchar(20) DEFAULT 'pending',
  `number_of_people` int(11) DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `user_id`, `tour_id`, `vehicle_id`, `start_date`, `end_date`, `total_price`, `booking_date`, `status`, `number_of_people`, `driver_id`) VALUES
(1, 2, 7, 1, '2025-10-17', '2025-10-25', 1440.02, '2025-10-16 03:53:44', 'pending', 2, NULL),
(2, 2, 7, 1, '2025-10-22', '2025-10-29', 720.01, '2025-10-19 23:57:20', 'pending', 1, NULL),
(3, 2, 7, 3, '2025-10-22', '2025-11-03', 1440.00, '2025-10-20 01:22:26', 'pending', 2, NULL),
(4, 2, NULL, 1, '2025-10-21', '2025-10-29', 10000.00, '2025-10-20 01:26:37', 'pending', 4, NULL),
(5, 2, 7, 3, '2025-10-21', '2025-10-22', 1440.00, '2025-10-20 01:43:22', 'pending', 2, NULL),
(6, 2, 1, 3, '2025-10-22', '2025-11-06', 7596.02, '2025-10-20 01:58:24', 'pending', 4, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `customer`
--

CREATE TABLE `customer` (
  `custrid` int(11) NOT NULL,
  `birthdate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int(11) NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `vehicle_type` varchar(50) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`driver_id`, `license_number`, `vehicle_type`, `rating`) VALUES
(1, 'DL12345', 'Sedan', 4.8),
(2, 'DL12346', 'Van', 4.6),
(3, 'DL12347', 'Pickup', 4.7),
(4, 'DL12348', 'Hatchback', 4.5),
(5, 'DL12349', 'Truck', 4.9),
(9, '1223445667', 'suv', 0.0),
(10, 'edfghjkjhgf', 'suv', 0.0);

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `position` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `hire_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `position`, `department`, `hire_date`) VALUES
(9, 'Driver', 'Transport', NULL),
(10, 'Driver', 'Transport', NULL),
(13, 'HR', 'HR', NULL),
(14, 'Tour Guide', 'Guides', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `itinerary`
--

CREATE TABLE `itinerary` (
  `itineraryid` int(11) NOT NULL,
  `custrid` int(11) DEFAULT NULL,
  `tour_id` int(11) DEFAULT NULL,
  `descr` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'completed'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `rating_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `rated_user_id` int(11) NOT NULL,
  `rating_type` enum('tourguide','driver') NOT NULL,
  `rating` int(1) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `comment` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tourguides`
--

CREATE TABLE `tourguides` (
  `tour_guide_id` int(11) NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `experience_years` int(11) DEFAULT NULL,
  `specialization` varchar(100) DEFAULT NULL,
  `rating` decimal(2,1) DEFAULT 0.0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tourguides`
--

INSERT INTO `tourguides` (`tour_guide_id`, `license_number`, `experience_years`, `specialization`, `rating`) VALUES
(14, '567544', 3, 'history', 0.0);

-- --------------------------------------------------------

--
-- Table structure for table `tours`
--

CREATE TABLE `tours` (
  `tour_id` int(11) NOT NULL,
  `tour_guide_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `destination` varchar(100) NOT NULL,
  `duration_days` int(11) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `availability` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tours`
--

INSERT INTO `tours` (`tour_id`, `tour_guide_id`, `name`, `description`, `destination`, `duration_days`, `price`, `availability`) VALUES
(1, 14, '12 Days Historic with Simien', 'Itinerary: Day 1: Arrival in Addis Ababa, city highlights (National Museum, Entoto). Day 2: Fly/Drive to Bahir Dar. Lake Tana boat trip to island monasteries. Day 3: Blue Nile Falls and Bahir Dar city tour. Day 4: Drive to Gondar. Visit Royal Enclosure and Debre Berhan Selassie. Day 5: Simien Mountains National Park day trip from Gondar; stunning viewpoints and wildlife. Day 6: Drive to Axum. En route scenic viewpoints. Day 7: Axum city tour: stelae field, Queen of Sheba\'s bath, churches. Day 8: Fly/Drive to Lalibela. First cluster of rock-hewn churches. Day 9: Lalibela second cluster; optional Asheton Maryam. Day 10: Fly/Drive to Addis Ababa. Leisure and shopping. Day 11: Optional Addis surrounds (Adadi Mariam, Tiya). Day 12: Departure.', 'Historic Circuit (North Ethiopia)', 12, 1899.00, 1),
(2, NULL, '9 Days Historic Route', 'Itinerary: Day 1: Addis Ababa city tour. Day 2: Fly/Drive to Bahir Dar; Lake Tana monasteries. Day 3: Blue Nile Falls; transfer to Gondar. Day 4: Gondar castles and church; afternoon to Debark or rest. Day 5: Simien Mountains National Park day hike. Day 6: Fly/Drive to Lalibela; first cluster of churches. Day 7: Lalibela second cluster; local village experience. Day 8: Return to Addis Ababa; leisure. Day 9: Departure.', 'Historic Circuit (North Ethiopia)', 9, 1499.00, 1),
(3, NULL, '7 Days Historic Route', 'Itinerary: Day 1: Addis Ababa highlights. Day 2: Fly/Drive to Bahir Dar; Lake Tana. Day 3: Blue Nile Falls; transfer to Gondar. Day 4: Gondar castles and church. Day 5: Fly/Drive to Lalibela; first cluster of churches. Day 6: Lalibela second cluster; optional trek. Day 7: Return to Addis Ababa and departure.', 'Historic Circuit (North Ethiopia)', 7, 1199.00, 1),
(4, NULL, '7 Days Simien Mountains', 'Itinerary: Day 1: Addis Ababa – Bahir Dar (via Debre Libanos and Blue Nile Gorge). Day 2: Bahir Dar: Lake Tana boat trip and Blue Nile Falls. Day 3: Bahir Dar – Gondar; castles and Debre Berhan Selassie. Day 4: Gondar – Simien Mountains NP – Gondar (day excursion). Day 5: Gondar – Lalibela (Drive); visit Awramba community if time permits. Day 6: Lalibela rock-hewn churches (two clusters). Day 7: Lalibela – Addis Ababa; shopping and departure.', 'Simien Mountains + North Highlights', 7, 1090.00, 1),
(5, NULL, '6 Days Northern Tour', 'Itinerary: Day 1: Addis Ababa city tour (Museum, Mercato, Entoto). Day 2: Fly/Drive to Bahir Dar. Lake Tana monasteries. Day 3: Blue Nile Falls; transfer to Gondar. Day 4: Gondar castles and church; afternoon rest. Day 5: Fly/Drive to Lalibela. First cluster of churches. Day 6: Second cluster and return to Addis Ababa.', 'Northern Tour (Bahir Dar, Gondar, Lalibela)', 6, 999.00, 1),
(6, NULL, '3 Days Simien Mountains', 'Itinerary: Day 1: Gondar to Debark, enter Simien NP; hike Sankaber area. Day 2: Trek Geech–Imet Gogo (or Sankaber–Geech) for panoramic views and Gelada baboons. Day 3: Morning hike; drive back to Gondar.', 'Simien Mountains', 3, 550.00, 1),
(7, 14, 'Dalol Depression Tour', 'Itinerary: Day 1: Fly/Drive to Semera; permits and briefing. Continue to Hamed Ela via Lake Afdera (salt lake swim). Day 2: Dallol hydrothermal fields (colorful sulfur springs), salt flats at Lake Asale, camel caravans; sunset photography. Day 3: Return via Semera to Addis Ababa.', 'Danakil Depression (Dallol)', 3, 720.00, 1),
(8, NULL, '5 Days Danakil Depression', 'Itinerary: Day 1: Addis Ababa – Semera (permits). Day 2: Lake Afdera; drive to Erta Ale base; night trek. Day 3: Sunrise at crater; descend; drive to Hamed Ela. Day 4: Dallol hydrothermal fields and Lake Asale; camel caravans. Day 5: Return to Addis Ababa.', 'Danakil Depression', 5, 890.00, 1),
(9, NULL, '7 Days Danakil Depression', 'Itinerary: Day 1: Addis Ababa – Semera (permits). Day 2: Lake Afdera; drive to Erta Ale base. Day 3: Trek and overnight at Erta Ale crater. Day 4: Descend to base; proceed to Hamed Ela. Day 5: Dallol hydrothermal fields; salt extraction sites. Day 6: Salt flats at Lake Asale; sunset photography. Day 7: Return to Addis Ababa.', 'Danakil Depression', 7, 1250.00, 1),
(10, NULL, '8 Days Danakil Depression via Awash', 'Itinerary: Day 1: Addis Ababa – Awash NP (game drive, waterfalls). Day 2: Awash – Semera (permits, Danakil briefing). Day 3: Semera – Lake Afdera – Erta Ale base. Day 4: Trek to Erta Ale summit; lava lake visit. Day 5: Descend and drive to Hamed Ela. Day 6: Dallol (sulfur springs), salt flats, camel caravans. Day 7: Return to Semera/drive towards Mille. Day 8: Return to Addis Ababa and departure.', 'Danakil Depression (via Awash)', 8, 1390.00, 1),
(11, NULL, 'Erta Ale Volcano Expedition', 'Itinerary: Day 1: Addis Ababa – Semera – Erta Ale base; evening trek to crater rim. Day 2: Sunrise at crater; descend and transfer to Lake Afdera (swim in saline lake). Day 3: Return to Addis Ababa.', 'Afar Region (Erta Ale)', 3, 680.00, 1),
(12, NULL, 'Full Day Addis Ababa City Tour', 'Itinerary: Morning: National Museum (Lucy), Holy Trinity Cathedral, Mount Entoto panorama. Afternoon: Merkato (largest open-air market), cultural coffee ceremony, souvenir stops. Evening: Optional traditional restaurant with cultural dances.', 'Addis Ababa', 1, 120.00, 1),
(13, NULL, 'Half Day Addis Ababa Tour', 'Itinerary: Option A (Morning): National Museum + Entoto. Option B (Afternoon): Merkato + Coffee Ceremony. Includes transfers and guiding.', 'Addis Ababa', 1, 70.00, 1),
(14, NULL, 'Short Trip from Addis', 'Itinerary: Day 1: Adadi Mariam rock-hewn church and Tiya stelae field (UNESCO). Day 2: Debre Zeit crater lakes or Menagesha Suba Forest hike (optional).', 'Addis Ababa Surroundings', 2, 220.00, 1),
(15, NULL, 'South Omo Valley – 7 Days', 'Itinerary: Day 1: Addis Ababa – Arba Minch. Day 2: Dorze village and Lake Chamo boat. Day 3: Arba Minch – Konso – Turmi (Hamer). Day 4: Omorate (Dassanech) and Hamer cultural experiences (bull jumping if available). Day 5: Turmi – Jinka (Ari). Day 6: Mago NP (Mursi) – Jinka – Konso. Day 7: Return to Addis Ababa.', 'South Omo Valley', 7, 1080.00, 1),
(16, NULL, 'South Omo Valley – 8 Days', 'Itinerary: Day 1: Addis Ababa – Arba Minch. Day 2: Dorze and Lake Chamo. Day 3: Konso terrace fields; drive to Turmi. Day 4: Omorate (Dassanech) and Hamer village. Day 5: Turmi – Kara or Nyangatom villages by Omo River. Day 6: Jinka – Mago NP (Mursi) – Jinka. Day 7: Key Afer market (if market day) – Konso. Day 8: Return to Addis Ababa.', 'South Omo Valley', 8, 1190.00, 1),
(17, NULL, 'South Omo Valley – 11 Days', 'Itinerary: Day 1: Addis Ababa – Arba Minch (via Butajira road). Day 2: Dorze village and Lake Chamo. Day 3: Konso (UNESCO) – Turmi. Day 4: Omorate (Dassanech), Hamer rituals (if available). Day 5: Kara villages near Korcho. Day 6: Nyangatom visit (conditions permitting). Day 7: Jinka – Mago NP (Mursi). Day 8: Ari village experiences – Key Afer market. Day 9: Yabello/Sidamo en route. Day 10: Rift Valley Lakes (Ziway, Langano). Day 11: Return to Addis Ababa.', 'South Omo Valley', 11, 1590.00, 1),
(18, NULL, 'Meskel Festival', 'Itinerary: Day 1: Addis Ababa city tour; introduction to Meskel traditions. Day 2: Meskel Eve (Demera) at Meskel Square – bonfire ceremony. Day 3: Meskel Day celebrations; cultural experiences and farewell.', 'Addis Ababa (Festival)', 3, 350.00, 1),
(19, NULL, 'Gena (Christmas)', 'Itinerary: Day 1: Fly/Drive to Lalibela; evening Christmas Eve mass (per calendar). Day 2: Christmas Day services; rock-hewn churches. Day 3: Local village experiences and return to Addis Ababa.', 'Lalibela (Festival)', 3, 420.00, 1),
(20, NULL, 'Timiket (Epiphany)', 'Itinerary: Day 1: Fly/Drive to Gondar; Eve processions with Tabots. Day 2: Timket morning ceremony at Fasilides Bath; afternoon festivities. Day 3: Gondar highlights and return to Addis.', 'Gondar (Festival)', 3, 390.00, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `registration_date` datetime DEFAULT current_timestamp(),
  `role` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `first_name`, `last_name`, `phone_number`, `address`, `registration_date`, `role`) VALUES
(1, 'hh', 'yedidiyab55@gmail.com', '$2a$10$Rv0l31tUfoc6J2wlEJgCmu0.0/NNnkibvtxkYL2plDX6LJkt880f2', '', '', NULL, NULL, '2025-10-14 00:52:22', 'customer'),
(2, 'hh2', 'yedidiyab5@gmail.com', '$2a$10$4KJxFdgh5ZZe3J5iLM/MbOcJ2VsWiwRmNs0hTPuWcqf.bFAsG8AkS', '', '', NULL, NULL, '2025-10-16 00:29:59', 'customer'),
(3, 'Tes', 'tes@gmail.com', '$2a$10$y6f.pUZKfmQ2deljSiAzw.ZsBHKHmF0FrL6UMufH/xFBz2fwu0hrK', 'Tesfa', 'Beyene', '0987652314', NULL, '2025-10-16 00:42:45', 'admin'),
(4, 'abebe_k', 'abebe@example.com', 'password123', 'Abebe', 'Kebede', '0911223344', NULL, '2025-10-16 00:46:30', 'driver'),
(5, 'mulu_h', 'mulu@example.com', 'password123', 'Mulu', 'Haile', '0911223345', NULL, '2025-10-16 00:46:30', 'driver'),
(6, 'tadesse_b', 'tadesse@example.com', 'password123', 'Tadesse', 'Bekele', '0911223346', NULL, '2025-10-16 00:46:30', 'driver'),
(7, 'hanna_t', 'hanna@example.com', 'password123', 'Hanna', 'Tesfaye', '0911223347', NULL, '2025-10-16 00:46:30', 'driver'),
(8, 'kebede_a', 'kebede@example.com', 'password123', 'Kebede', 'Alemu', '0911223348', NULL, '2025-10-16 00:46:30', 'driver'),
(9, 'hana.wvh2', 'hana@gmail.com', '$2a$10$LbJNzrOwqA.nP7xNHGazfOiJMUuZqCNDpD8EuV9Ubum2eDGNNbrBm', 'hana', '', '+2519875643', NULL, '2025-10-16 01:28:54', 'driver'),
(10, 'blu.2h6d', 'blu@gmail.com', '$2a$10$m21YxJvBft7NI7toQmPWZOIunjpzy095dukGUvWv/MarHng4gCYfq', 'blu', '', '+2519805643', NULL, '2025-10-16 02:48:09', 'driver'),
(13, 'danu.v1zk', 'danu@gmail.com', '$2a$10$S7VvsCi34CyQGGA4ZUp1DO9V17oh0neWcTF1q8kO2DunW4FbgpFMK', 'danu', '', '0987654334', NULL, '2025-10-20 00:20:57', 'employee'),
(14, 'londa.boyr', 'londa@gmail.com', '$2a$10$Edri2fTLUEdhwKTyr/HEqemV7dws.mpXZXXvQzbXCYw7ySar8t17y', 'londa', '', '098765656', NULL, '2025-10-20 00:59:20', 'tourguide');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `make` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `year` int(11) NOT NULL,
  `license_plate` varchar(20) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `daily_rate` decimal(10,2) NOT NULL,
  `status` varchar(20) DEFAULT 'available'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `driver_id`, `make`, `model`, `year`, `license_plate`, `capacity`, `daily_rate`, `status`) VALUES
(1, 1, 'Toyota', 'Corolla', 2018, 'AB123CD', 4, 2500.00, 'available'),
(2, 2, 'Hyundai', 'H1', 2020, 'EF456GH', 8, 4000.00, 'in_service'),
(3, 3, 'Ford', 'Ranger', 2022, 'IJ789KL', 5, 3500.00, 'available'),
(4, 4, 'Suzuki', 'Swift', 2019, 'MN012OP', 4, 2300.00, 'maintenance'),
(5, 5, 'Isuzu', 'D-Max', 2021, 'QR345ST', 2, 3800.00, 'available');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `tour_id` (`tour_id`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `fk_booking_driver` (`driver_id`);

--
-- Indexes for table `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`custrid`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`),
  ADD UNIQUE KEY `license_number` (`license_number`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`);

--
-- Indexes for table `itinerary`
--
ALTER TABLE `itinerary`
  ADD PRIMARY KEY (`itineraryid`),
  ADD KEY `custrid` (`custrid`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD UNIQUE KEY `booking_id` (`booking_id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`rating_id`),
  ADD UNIQUE KEY `unique_booking_rating` (`booking_id`,`rated_user_id`,`rating_type`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `rated_user_id` (`rated_user_id`);

--
-- Indexes for table `tourguides`
--
ALTER TABLE `tourguides`
  ADD PRIMARY KEY (`tour_guide_id`),
  ADD UNIQUE KEY `license_number` (`license_number`);

--
-- Indexes for table `tours`
--
ALTER TABLE `tours`
  ADD PRIMARY KEY (`tour_id`),
  ADD KEY `tour_guide_id` (`tour_guide_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone_number` (`phone_number`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD UNIQUE KEY `license_plate` (`license_plate`),
  ADD KEY `driver_id` (`driver_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `ratings`
--
ALTER TABLE `ratings`
  MODIFY `rating_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `tours`
--
ALTER TABLE `tours`
  MODIFY `tour_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admins`
--
ALTER TABLE `admins`
  ADD CONSTRAINT `admins_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`tour_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_booking_driver` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`);

--
-- Constraints for table `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `itinerary`
--
ALTER TABLE `itinerary`
  ADD CONSTRAINT `itinerary_ibfk_1` FOREIGN KEY (`custrid`) REFERENCES `customer` (`custrid`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ratings_ibfk_3` FOREIGN KEY (`rated_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tourguides`
--
ALTER TABLE `tourguides`
  ADD CONSTRAINT `tourguides_ibfk_1` FOREIGN KEY (`tour_guide_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `tours`
--
ALTER TABLE `tours`
  ADD CONSTRAINT `tours_ibfk_1` FOREIGN KEY (`tour_guide_id`) REFERENCES `tourguides` (`tour_guide_id`) ON DELETE SET NULL;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
