-- Migration number: 0004 	 2024-12-14T03:47:55.825Z

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
    isApproved BOOLEAN,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);