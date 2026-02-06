-- Add title column to promotion table
-- This allows promotions to have a descriptive title

ALTER TABLE `promotion` 
ADD COLUMN `title` varchar(255) DEFAULT NULL AFTER `promoid`;
