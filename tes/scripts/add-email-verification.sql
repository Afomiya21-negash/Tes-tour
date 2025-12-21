-- Add email verification fields to users table
ALTER TABLE `users` 
ADD COLUMN `email_verified` BOOLEAN DEFAULT FALSE AFTER `email`,
ADD COLUMN `verification_token` VARCHAR(255) DEFAULT NULL AFTER `email_verified`,
ADD COLUMN `verification_token_expires` DATETIME DEFAULT NULL AFTER `verification_token`;

-- Add index for faster token lookups
ALTER TABLE `users`
ADD INDEX `idx_verification_token` (`verification_token`);
