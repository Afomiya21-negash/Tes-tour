-- ============================================================================
-- Add latitude and longitude columns to tours table
-- This enables route tracking from tour guide to destination
-- ============================================================================

USE tes_tour;

-- Add latitude and longitude columns
ALTER TABLE `tours` 
ADD COLUMN `latitude` DECIMAL(10,8) DEFAULT NULL COMMENT 'Destination latitude',
ADD COLUMN `longitude` DECIMAL(11,8) DEFAULT NULL COMMENT 'Destination longitude';

-- Add some sample coordinates for existing tours
-- These are approximate coordinates for popular Ethiopian destinations

-- Tour 1: Historic Circuit (Lalibela as main destination)
UPDATE tours SET latitude = 12.0333, longitude = 39.0333 WHERE tour_id = 1;

-- Tour 2: Historic Route (Lalibela)
UPDATE tours SET latitude = 12.0333, longitude = 39.0333 WHERE tour_id = 2;

-- Tour 3: Historic Route (Lalibela)
UPDATE tours SET latitude = 12.0333, longitude = 39.0333 WHERE tour_id = 3;

-- Tour 4: Simien Mountains
UPDATE tours SET latitude = 13.2000, longitude = 38.0000 WHERE tour_id = 4;

-- Tour 5: Northern Tour (Lalibela)
UPDATE tours SET latitude = 12.0333, longitude = 39.0333 WHERE tour_id = 5;

-- Tour 6: Simien Mountains
UPDATE tours SET latitude = 13.2000, longitude = 38.0000 WHERE tour_id = 6;

-- Tour 7: Danakil Depression (Dallol)
UPDATE tours SET latitude = 14.2417, longitude = 40.3000 WHERE tour_id = 7;

-- Tour 8: Omo Valley (if exists)
UPDATE tours SET latitude = 5.5000, longitude = 36.5000 WHERE tour_id = 8;

-- Tour 9: Bale Mountains (if exists)
UPDATE tours SET latitude = 7.0667, longitude = 39.7500 WHERE tour_id = 9;

-- Tour 10: Harar (if exists)
UPDATE tours SET latitude = 9.3100, longitude = 42.1200 WHERE tour_id = 10;

SELECT 'Tour coordinates added successfully!' AS status;

-- Verify the changes
SELECT 
  tour_id, 
  name, 
  destination, 
  latitude, 
  longitude 
FROM tours 
ORDER BY tour_id;

