-- Add image field to vehicles table
ALTER TABLE vehicles ADD COLUMN image_url VARCHAR(255) DEFAULT NULL;

-- Update vehicles with sample images
UPDATE vehicles SET image_url = '/images/vehicles/toyota-corolla.jpg' WHERE vehicle_id = 1;
UPDATE vehicles SET image_url = '/images/vehicles/hyundai-h1.jpg' WHERE vehicle_id = 2;
UPDATE vehicles SET image_url = '/images/vehicles/ford-ranger.jpg' WHERE vehicle_id = 3;
UPDATE vehicles SET image_url = '/images/vehicles/suzuki-swift.jpg' WHERE vehicle_id = 4;
UPDATE vehicles SET image_url = '/images/vehicles/isuzu-dmax.jpg' WHERE vehicle_id = 5;
