-- SIMPLE VERSION - Try this first
-- Fix promotion table to make promoid AUTO_INCREMENT with PRIMARY KEY
-- This fixes the error: Field 'promoid' doesn't have a default value

-- This single statement should work if promoid is already the primary key
-- OR if there's no primary key defined yet
ALTER TABLE `promotion` 
MODIFY COLUMN `promoid` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY;
