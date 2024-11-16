-- Migration number: 0002 	 2024-11-15T14:04:41.923Z
-- Migration number: 0002 	 2024-11-15T13:45:47.969Z
-- Drop the table if it exists
DROP TABLE IF EXISTS tables;

-- Create the table
CREATE TABLE tables (
    tableId INTEGER PRIMARY KEY,
    partnerId INTEGER,
    seatingCapacity INTEGER, 
    status VARCHAR(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);
