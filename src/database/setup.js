import { getDb } from "./db.js";

export function setupDatabase() {
  const db = getDb();

  try {
    // Use a shorter transaction timeout
    db.pragma("busy_timeout = 5000");

    // Begin transaction
    db.exec("BEGIN TRANSACTION;");

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        mobile TEXT,
        address TEXT,
        dateOfBirth TEXT,
        resetToken TEXT,
        resetTokenExpiry TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create businesses table
    db.exec(`
      CREATE TABLE IF NOT EXISTS businesses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        userId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    // Create customers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS customers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phoneNumber TEXT,
        balance REAL DEFAULT 0,
        businessId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (businessId) REFERENCES businesses(id)
      );
    `);

    // Create suppliers table
    db.exec(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phoneNumber TEXT,
        balance REAL DEFAULT 0,
        businessId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (businessId) REFERENCES businesses(id)
      );
    `);

    // Create transactions table
    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
        amount REAL NOT NULL,
        customerId TEXT,
        supplierId TEXT,
        description TEXT,
        date TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('CUSTOMER', 'SUPPLIER')),
        paymentMode TEXT NOT NULL CHECK (paymentMode IN ('CASH', 'ONLINE')),
        businessId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (businessId) REFERENCES businesses(id),
        FOREIGN KEY (customerId) REFERENCES customers(id),
        FOREIGN KEY (supplierId) REFERENCES suppliers(id)
      );
    `);

    // Commit transaction
    db.exec("COMMIT;");

    console.log("Database setup completed successfully");
  } catch (error) {
    // Rollback on error
    db.exec("ROLLBACK;");
    console.error("Database Setup Error:", error);
    throw error;
  }
}
