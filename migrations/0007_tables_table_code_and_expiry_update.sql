-- Migration number: 0007 	 2025-04-23T12:20:56.715Z
ALTER TABLE tables ADD COLUMN checkin_code TEXT;
ALTER TABLE tables ADD COLUMN code_expires_at TIMESTAMP;
