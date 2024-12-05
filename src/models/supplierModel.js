import Database from 'better-sqlite3';
import { config } from '../config/config.js';

export class SupplierModel {
  static getAll(businessId, search) {
    const db = new Database(config.dbPath);
    let suppliers;
    
    if (search) {
      suppliers = db.prepare(`
        SELECT * FROM suppliers 
        WHERE businessId = ? AND (name LIKE ? OR phoneNumber LIKE ?)
      `).all(businessId, `%${search}%`, `%${search}%`);
    } else {
      suppliers = db.prepare('SELECT * FROM suppliers WHERE businessId = ?')
        .all(businessId);
    }
    
    db.close();
    return suppliers;
  }

  static getById(id, businessId) {
    const db = new Database(config.dbPath);
    const supplier = db.prepare(`
      SELECT * FROM suppliers WHERE id = ? AND businessId = ?
    `).get(id, businessId);
    db.close();
    return supplier;
  }

  static create({ id, name, phoneNumber, balance, businessId }) {
    const db = new Database(config.dbPath);
    db.prepare(`
      INSERT INTO suppliers (id, name, phoneNumber, balance, businessId) 
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, phoneNumber, balance || 0, businessId);
    db.close();
    return { id, name, phoneNumber, balance: balance || 0, businessId };
  }

  static update(id, businessId, { name, phoneNumber, balance }) {
    const db = new Database(config.dbPath);
    db.prepare(`
      UPDATE suppliers 
      SET name = ?, phoneNumber = ?, balance = ? 
      WHERE id = ? AND businessId = ?
    `).run(name, phoneNumber, balance, id, businessId);
    db.close();
    return { id, name, phoneNumber, balance, businessId };
  }

  static delete(id, businessId) {
    const db = new Database(config.dbPath);
    db.prepare('DELETE FROM transactions WHERE supplierId = ? AND businessId = ?')
      .run(id, businessId);
    db.prepare('DELETE FROM suppliers WHERE id = ? AND businessId = ?')
      .run(id, businessId);
    db.close();
  }
}