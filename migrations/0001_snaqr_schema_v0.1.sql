-- Migration number: 0001 	 2024-10-20T15:49:22.639Z

-- Table: feedback
DROP TABLE IF EXISTS feedback;
CREATE TABLE feedback (
    partnerId INTEGER NOT NULL,
    feedbackId INTEGER PRIMARY KEY,
    consumerName VARCHAR(100),
    consumerEmail VARCHAR(255),
    consumerPhone VARCHAR(20),
    rating REAL,
    feedbackComments TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: menu
DROP TABLE IF EXISTS menu;
CREATE TABLE menu (
    menuId INTEGER PRIMARY KEY,
    partnerId INTEGER,
    itemName VARCHAR(255),
    description TEXT,
    price DECIMAL(10, 2),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(200),
    image VARCHAR(200),
    dietCategory INTEGER,
    subcategory1 VARCHAR(200),
    subcategory2 VARCHAR(200),
    subcategory3 VARCHAR(200),
    serves INTEGER,
    activeFlag INTEGER
);

-- Table: partner_details
DROP TABLE IF EXISTS partner_details;
CREATE TABLE partner_details (
    partnerId INTEGER PRIMARY KEY,
    partnerName VARCHAR(255) NOT NULL,
    partnerType VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    postalCode VARCHAR(20),
    owner VARCHAR(100),
    website VARCHAR(100),
    social1 VARCHAR(255),
    social2 VARCHAR(255),
    social3 VARCHAR(255),
    about VARCHAR(255),
    contactNo VARCHAR(20),
    rating DECIMAL(2, 1),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    partnerHandle VARCHAR(255),
    qrData TEXT NOT NULL,
    UNIQUE(partnerHandle)
);
