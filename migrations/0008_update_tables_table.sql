-- Migration number: 0008 	 2025-04-23T13:11:07.727Z
ALTER TABLE tables DROP COLUMN checkin_code;
ALTER TABLE tables DROP COLUMN code_expires_at;
ALTER TABLE tables ADD COLUMN checkinCode TEXT;
