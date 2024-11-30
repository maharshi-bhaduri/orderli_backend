-- Migration number: 0003 	 2024-11-24T10:54:11.462Z

alter table tables add column globalTableId VARCHAR(200);
alter table tables add column localTableId INTEGER;
