-- ============================================================================
-- ONE-STEP FIX FOR GPS TRACKING
-- Run this entire script in phpMyAdmin to fix all issues
-- ============================================================================

USE tes_tour;

-- Step 1: Add latitude and longitude columns to tours table
ALTER TABLE `tours` 
ADD COLUMN IF NOT EXISTS `latitude` DECIMAL(10,8) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS `longitude` DECIMAL(11,8) DEFAULT NULL;

-- Step 2: Add coordinates for all tours
-- Lalibela (Historic Circuit tours)
UPDATE tours SET latitude = 12.0333, longitude = 39.0333 
WHERE tour_id IN (1, 2, 3, 5) AND (latitude IS NULL OR longitude IS NULL);

-- Simien Mountains
UPDATE tours SET latitude = 13.2000, longitude = 38.0000 
WHERE tour_id IN (4, 6) AND (latitude IS NULL OR longitude IS NULL);

-- Danakil Depression
UPDATE tours SET latitude = 14.2417, longitude = 40.3000 
WHERE tour_id = 7 AND (latitude IS NULL OR longitude IS NULL);

-- Step 3: Make sure booking #19 is in-progress (if it exists)
UPDATE bookings 
SET status = 'in-progress' 
WHERE booking_id = 19 AND status = 'confirmed';

-- Step 4: Verify everything is set up correctly
SELECT 
  '✅ GPS Tracking Setup Complete!' as status,
  COUNT(*) as tours_with_coordinates
FROM tours 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Show all tours with coordinates
SELECT 
  tour_id,
  name,
  destination,
  latitude,
  longitude,
  CASE 
    WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN '✅ Ready'
    ELSE '❌ Missing coordinates'
  END as tracking_status
FROM tours
ORDER BY tour_id;

-- Show booking #19 details (if exists)
SELECT 
  b.booking_id,
  b.status,
  CONCAT(u.first_name, ' ', u.last_name) as customer,
  CONCAT(tg.first_name, ' ', tg.last_name) as tour_guide,
  t.name as tour_name,
  t.latitude,
  t.longitude,
  CASE 
    WHEN b.status = 'in-progress' THEN '✅ Ready for tracking'
    WHEN b.status = 'confirmed' THEN '⚠️ Tour guide needs to click "Start Tour"'
    ELSE '❌ Not trackable'
  END as tracking_status
FROM bookings b
LEFT JOIN users u ON b.user_id = u.user_id
LEFT JOIN users tg ON b.tour_guide_id = tg.tour_guide_id
LEFT JOIN tours t ON b.tour_id = t.tour_id
WHERE b.booking_id = 19;

