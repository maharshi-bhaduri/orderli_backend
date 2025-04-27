-- Migration number: 0007 	 2025-04-26T19:49:04.190Z

-- billing_details
DROP TABLE IF EXISTS billing_details;
CREATE TABLE billing_details (
    billingDetailsId INTEGER PRIMARY KEY,
    partnerId INTEGER NOT NULL,
    gstin VARCHAR(20),
    footerMessage TEXT,
    upiId VARCHAR(200),
    currency VARCHAR(5) DEFAULT 'INR',
    charges TEXT, -- JSON string
    discounts TEXT, -- JSON string
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);