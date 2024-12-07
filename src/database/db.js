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
