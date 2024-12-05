import Database from "better-sqlite3";
import { config } from "../config/config.js";

export function setupDatabase() {
  const db = new Database(config.dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      balance REAL DEFAULT 0,
      businessId TEXT NOT NULL,
      FOREIGN KEY (businessId) REFERENCES businesses(id)
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phoneNumber TEXT NOT NULL,
      balance REAL DEFAULT 0,
      businessId TEXT NOT NULL,
      FOREIGN KEY (businessId) REFERENCES businesses(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT CHECK(type IN ('IN', 'OUT')) NOT NULL,
      amount REAL NOT NULL,
      customerId TEXT,
      supplierId TEXT,
      description TEXT,
      date TEXT NOT NULL,
      category TEXT CHECK(category IN ('CUSTOMER', 'SUPPLIER')) NOT NULL,
      paymentMode TEXT CHECK(paymentMode IN ('CASH', 'ONLINE')) NOT NULL,
      businessId TEXT NOT NULL,
      FOREIGN KEY (businessId) REFERENCES businesses(id),
      FOREIGN KEY (customerId) REFERENCES customers(id),
      FOREIGN KEY (supplierId) REFERENCES suppliers(id)
    );
  `);

  db.close();
}
