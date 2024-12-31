import Database from "better-sqlite3";
import { config } from "../config/config.js";
import path from "path";
import fs from "fs";

const dbPath = path.resolve(process.cwd(), config.dbPath);

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db = null;

export function getDb() {
  if (!db) {
    try {
      db = new Database(dbPath, {
        fileMustExist: false,
        timeout: config.database.timeout,
        verbose: config.database.verbose,
      });

      // Configure database settings
      db.pragma("journal_mode = WAL");
      db.pragma("synchronous = NORMAL");
      db.pragma("foreign_keys = ON");
      db.pragma("busy_timeout = 5000");

      // Add reset token fields if they don't exist
      db.prepare(
        `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          mobile TEXT,
          address TEXT,
          date_of_birth TEXT,
          reset_token TEXT,
          reset_token_expiry DATETIME
        )
      `
      ).run();

      // Add columns if they don't exist (for existing tables)
      const columns = db.prepare(`PRAGMA table_info(users)`).all();
      const columnNames = columns.map((col) => col.name);

      if (!columnNames.includes("reset_token")) {
        db.prepare("ALTER TABLE users ADD COLUMN reset_token TEXT").run();
      }
      if (!columnNames.includes("reset_token_expiry")) {
        db.prepare(
          "ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME"
        ).run();
      }

      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection error:", error);
      throw error;
    }
  }
  return db;
}

export function closeDb() {
  if (db) {
    try {
      db.prepare("PRAGMA optimize").run();
      db.close();
      db = null;
      console.log("Database connection closed");
    } catch (error) {
      console.error("Error closing database:", error);
    }
  }
}

// Cleanup handler
function cleanup() {
  closeDb();
  process.exit(0);
}

// Handle process termination
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  cleanup();
});
