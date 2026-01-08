-- Normalized Notification System Schema

-- 1. Create unified notification types table
CREATE TABLE `notification_types` (
  `type_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_name` varchar(50) NOT NULL UNIQUE,
  `description` text,
  `default_template` text,
  `created_at` timestamp DEFAULT current_timestamp(),
  PRIMARY KEY (`type_id`)
);

-- Insert notification types
INSERT INTO `notification_types` (`type_name`, `description`, `default_template`) VALUES
('booking_created', 'New booking created', 'New booking #{booking_id} created by {customer_name}'),
('booking_confirmed', 'Booking confirmed', 'Your booking #{booking_id} has been confirmed'),
('booking_cancelled', 'Booking cancelled', 'Booking #{booking_id} has been cancelled'),
('payment_received', 'Payment received', 'Payment of {amount} received for booking #{booking_id}'),
('refund_requested', 'Refund requested', 'Refund requested for booking #{booking_id}'),
('refund_approved', 'Refund approved', 'Refund approved for booking #{booking_id}'),
('refund_rejected', 'Refund rejected', 'Refund rejected for booking #{booking_id}'),
('change_request', 'Change request submitted', 'Change request submitted for booking #{booking_id}'),
('itinerary_updated', 'Itinerary updated', 'Itinerary updated for booking #{booking_id}'),
('tour_assigned', 'Tour guide assigned', 'Tour guide assigned to booking #{booking_id}'),
('driver_assigned', 'Driver assigned', 'Driver assigned to booking #{booking_id}'),
('rating_received', 'Rating received', 'New rating received for booking #{booking_id}'),
('location_update', 'Location tracking update', 'Location update for booking #{booking_id}');

-- 2. Create unified notifications table
CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL, -- Target user (admin, employee, guide, driver)
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` json DEFAULT NULL, -- Store additional structured data
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `idx_type_id` (`type_id`),
  KEY `idx_booking_id` (`booking_id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_priority` (`priority`),
  KEY `idx_user_read_created` (`user_id`, `is_read`, `created_at`),
  FOREIGN KEY (`type_id`) REFERENCES `notification_types` (`type_id`),
  FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

-- 3. Create notification recipients table (for notifications sent to multiple users)
CREATE TABLE `notification_recipients` (
  `recipient_id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_role` varchar(20) NOT NULL, -- 'admin', 'employee', 'tourguide', 'driver', 'customer'
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT current_timestamp(),
  PRIMARY KEY (`recipient_id`),
  UNIQUE KEY `unique_notification_user` (`notification_id`, `user_id`),
  KEY `idx_notification_id` (`notification_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_role` (`user_role`),
  KEY `idx_is_read` (`is_read`),
  FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`notification_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

-- 4. Create notification preferences table
CREATE TABLE `notification_preferences` (
  `preference_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `email_enabled` tinyint(1) DEFAULT 1,
  `sms_enabled` tinyint(1) DEFAULT 0,
  `push_enabled` tinyint(1) DEFAULT 1,
  `in_app_enabled` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`preference_id`),
  UNIQUE KEY `unique_user_type` (`user_id`, `type_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_type_id` (`type_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`type_id`) REFERENCES `notification_types` (`type_id`) ON DELETE CASCADE
);

-- 5. Create notification delivery log table
CREATE TABLE `notification_delivery_log` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `delivery_type` enum('email','sms','push','in_app') NOT NULL,
  `status` enum('pending','sent','delivered','failed','bounced') DEFAULT 'pending',
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `retry_count` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT current_timestamp(),
  PRIMARY KEY (`log_id`),
  KEY `idx_notification_id` (`notification_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_delivery_type` (`delivery_type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`notification_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
);

-- Migration script to move existing notifications
-- Step 1: Migrate admin notifications
INSERT INTO `notifications` (`type_id`, `booking_id`, `customer_id`, `user_id`, `title`, `message`, `data`, `created_at`)
SELECT 
  nt.type_id,
  an.booking_id,
  an.customer_id,
  u.user_id,
  CONCAT('Admin: ', an.type),
  an.message,
  JSON_OBJECT(
    'notification_type', 'admin',
    'customer_name', an.customer_name,
    'customer_email', an.customer_email
  ),
  an.created_at
FROM `admin_notifications` an
JOIN `users` u ON u.role = 'admin'
JOIN `notification_types` nt ON nt.type_name = CASE 
  WHEN an.type = 'change_request' THEN 'change_request'
  ELSE 'booking_created'
END;

-- Step 2: Migrate employee notifications
INSERT INTO `notifications` (`type_id`, `booking_id`, `customer_id`, `user_id`, `title`, `message`, `data`, `created_at`)
SELECT 
  nt.type_id,
  en.booking_id,
  en.customer_id,
  u.user_id,
  CONCAT('Employee: ', en.type),
  en.message,
  JSON_OBJECT(
    'notification_type', 'employee',
    'customer_name', en.customer_name,
    'customer_email', en.customer_email
  ),
  en.created_at
FROM `notification` en
JOIN `users` u ON u.role = 'employee'
JOIN `notification_types` nt ON nt.type_name = CASE 
  WHEN en.type = 'refund_request' THEN 'refund_requested'
  ELSE 'booking_created'
END;

-- Step 3: Migrate itinerary notifications
INSERT INTO `notifications` (`type_id`, `booking_id`, `customer_id`, `user_id`, `title`, `message`, `data`, `created_at`)
SELECT 
  nt.type_id,
  inot.booking_id,
  inot.customer_id,
  inot.tour_guide_id,
  'Itinerary Update',
  inot.message,
  JSON_OBJECT(
    'notification_type', 'itinerary',
    'itinerary_id', inot.itinerary_id,
    'tour_guide_id', inot.tour_guide_id
  ),
  inot.created_at
FROM `itinerary_notifications` inot
JOIN `notification_types` nt ON nt.type_name = 'itinerary_updated';

-- Step 4: Set up default notification preferences for all users
INSERT INTO `notification_preferences` (`user_id`, `type_id`, `email_enabled`, `sms_enabled`, `push_enabled`, `in_app_enabled`)
SELECT 
  u.user_id,
  nt.type_id,
  CASE 
    WHEN u.role = 'admin' THEN 1
    WHEN u.role = 'employee' THEN 1
    WHEN u.role = 'tourguide' THEN 1
    WHEN u.role = 'driver' THEN 1
    ELSE 0
  END as email_enabled,
  0 as sms_enabled,
  CASE 
    WHEN u.role = 'customer' THEN 1
    ELSE 0
  END as push_enabled,
  1 as in_app_enabled
FROM `users` u
CROSS JOIN `notification_types` nt;

-- Create indexes for better performance
CREATE INDEX `idx_notifications_composite` ON `notifications` (`user_id`, `is_read`, `created_at` DESC);
CREATE INDEX `idx_recipients_composite` ON `notification_recipients` (`user_id`, `user_role`, `is_read`, `created_at` DESC);
CREATE INDEX `idx_delivery_composite` ON `notification_delivery_log` (`notification_id`, `delivery_type`, `status`);

-- Create view for easy notification access
CREATE VIEW `user_notifications` AS
SELECT 
  n.notification_id,
  n.type_id,
  nt.type_name,
  n.booking_id,
  n.customer_id,
  n.user_id,
  n.title,
  n.message,
  n.data,
  n.priority,
  n.is_read,
  n.read_at,
  n.created_at,
  n.expires_at,
  u.username,
  u.first_name,
  u.last_name,
  u.email as user_email,
  u.role as user_role
FROM `notifications` n
JOIN `notification_types` nt ON n.type_id = nt.type_id
LEFT JOIN `users` u ON n.user_id = u.user_id;

-- Create view for notification statistics
CREATE VIEW `notification_stats` AS
SELECT 
  nt.type_name,
  COUNT(*) as total_notifications,
  SUM(CASE WHEN n.is_read = 1 THEN 1 ELSE 0 END) as read_notifications,
  SUM(CASE WHEN n.is_read = 0 THEN 1 ELSE 0 END) as unread_notifications,
  DATE(n.created_at) as notification_date
FROM `notifications` n
JOIN `notification_types` nt ON n.type_id = nt.type_id
GROUP BY nt.type_name, DATE(n.created_at)
ORDER BY notification_date DESC, total_notifications DESC;
