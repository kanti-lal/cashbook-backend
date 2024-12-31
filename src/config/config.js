// import { config as dotenvConfig } from "dotenv";
// import path from "path";

// dotenvConfig();

// export const config = {
//   port: process.env.PORT || 3000,
//   dbPath: process.env.DATABASE_FILE || path.join(process.cwd(), "cashlink.db"),
// };

import { config as dotenvConfig } from "dotenv";
import path from "path";
import crypto from "crypto";

dotenvConfig();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  dbPath: process.env.DATABASE_FILE || path.join(process.cwd(), "cashlink.db"),
  env: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || crypto.randomBytes(64).toString("hex"),

  // Additional configurations
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",

  // Database configuration
  database: {
    path: process.env.DATABASE_FILE || path.join(process.cwd(), "cashlink.db"),
    timeout: 10000,
    verbose: process.env.NODE_ENV === "development" ? console.log : null,
  },
  email: {
    user: process.env.SMTP_USER,
    appPassword: process.env.SMTP_PASS,
  },
  appUrl: process.env.FRONTEND_URL,
  brandName: process.env.BRAND_NAME,
};
