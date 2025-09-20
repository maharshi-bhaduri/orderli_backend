-- Migration number: 0010 	 2025-09-03T16:40:46.289Z
-- Migration number: 0009 	 2025-09-03T16:32:03.089Z
DROP TABLE IF EXISTS order_items_live;

CREATE TABLE orders (
    orderItemId INTEGER PRIMARY KEY,  -- no AUTOINCREMENT
    createdAt TEXT NOT NULL ,
    updatedAt TEXT NOT NULL ,
    partnerId INTEGER NOT NULL,
    menuId INTEGER NOT NULL,
    itemName TEXT,
    quantity INTEGER NOT NULL ,
    itemPrice REAL NOT NULL,
    itemStatus INTEGER NOT NULL ,
    tableId INTEGER,
    orderId INTEGER,
    complete INTEGER 
);
