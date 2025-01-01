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

export function addAdminColumns() {
  const db = getDb();

  try {
    // Check if columns exist first to avoid errors
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    const columns = tableInfo.map((col) => col.name);

    // Add is_blocked column if it doesn't exist
    if (!columns.includes("is_blocked")) {
      db.prepare(
        "ALTER TABLE users ADD COLUMN is_blocked INTEGER DEFAULT 0"
      ).run();
    }

    // Add last_login column if it doesn't exist
    if (!columns.includes("last_login")) {
      db.prepare("ALTER TABLE users ADD COLUMN last_login DATETIME").run();
    }

    // Add created_at column if it doesn't exist
    if (!columns.includes("created_at")) {
      db.prepare(
        "ALTER TABLE users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP"
      ).run();
    }

    console.log("Admin columns added successfully");
  } catch (error) {
    console.error("Error adding admin columns:", error);
    throw error;
  }
}
