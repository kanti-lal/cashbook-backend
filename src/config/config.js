import { config as dotenvConfig } from 'dotenv';
import path from 'path';

dotenvConfig();

export const config = {
  port: process.env.PORT || 3000,
  dbPath: process.env.DATABASE_FILE || path.join(process.cwd(), 'cashlink.db')
};