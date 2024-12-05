import Database from 'better-sqlite3';
import { config } from '../config/config.js';

export class BusinessModel {
  static getAll() {
    const db = new Database(config.dbPath);
    const businesses = db.prepare('SELECT * FROM businesses').all();
    db.close();
    return businesses;
  }

  static create({ id, name, createdAt }) {
    const db = new Database(config.dbPath);
    db.prepare('INSERT INTO businesses (id, name, createdAt) VALUES (?, ?, ?)')
      .run(id, name, createdAt);
    db.close();
    return { id, name, createdAt };
  }
}