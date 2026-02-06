-- Fix promotion table to make promoid AUTO_INCREMENT
-- This fixes the error: Field 'promoid' doesn't have a default value
-- AUTO_INCREMENT columns must be defined as a key (primary key)

-- IMPORTANT: Run these statements one at a time in order
-- If you get an error on Step 1 saying "Duplicate primary key", skip to Step 2

-- Step 1: Make promoid the primary key (skip this if promoid is already the primary key)
-- If you get "Duplicate primary key defined" error, that's okay - just proceed to Step 2
ALTER TABLE `promotion` 
ADD PRIMARY KEY (`promoid`);

-- Step 2: Modify promoid to be AUTO_INCREMENT
ALTER TABLE `promotion` 
MODIFY COLUMN `promoid` int(11) NOT NULL AUTO_INCREMENT;
