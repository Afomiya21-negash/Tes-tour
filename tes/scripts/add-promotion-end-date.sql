-- Add end_date column to promotion table
-- This allows promotions to have an expiration date

ALTER TABLE `promotion` 
ADD COLUMN `end_date` date DEFAULT NULL AFTER `date`;
