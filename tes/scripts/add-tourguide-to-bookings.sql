-- Add tour_guide_id field to bookings table for proper tour guide assignment
ALTER TABLE bookings ADD COLUMN tour_guide_id INT(11) DEFAULT NULL;

-- Add foreign key constraint for tour guide
ALTER TABLE bookings ADD CONSTRAINT fk_booking_tourguide 
FOREIGN KEY (tour_guide_id) REFERENCES users(user_id) ON DELETE SET NULL;

-- Update existing bookings to have tour guides assigned based on the tour's tour_guide_id
UPDATE bookings b 
JOIN tours t ON b.tour_id = t.tour_id 
SET b.tour_guide_id = t.tour_guide_id 
WHERE t.tour_guide_id IS NOT NULL;
