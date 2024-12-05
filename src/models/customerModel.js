import Database from 'better-sqlite3';
import { config } from '../config/config.js';

export class CustomerModel {
  static getAll(businessId, search) {
    const db = new Database(config.dbPath);
    let customers;
    
    if (search) {
      customers = db.prepare(`
        SELECT * FROM customers 
        WHERE businessId = ? AND (name LIKE ? OR phoneNumber LIKE ?)
      `).all(businessId, `%${search}%`, `%${search}%`);
    } else {
      customers = db.prepare('SELECT * FROM customers WHERE businessId = ?')
        .all(businessId);
    }
    
    db.close();
    return customers;
  }

  static getById(id, businessId) {
    const db = new Database(config.dbPath);
    const customer = db.prepare(`
      SELECT * FROM customers WHERE id = ? AND businessId = ?
    `).get(id, businessId);
    db.close();
    return customer;
  }

  static create({ id, name, phoneNumber, balance, businessId }) {
    const db = new Database(config.dbPath);
    db.prepare(`
      INSERT INTO customers (id, name, phoneNumber, balance, businessId) 
      VALUES (?, ?, ?, ?, ?)
    `).run(id, name, phoneNumber, balance || 0, businessId);
    db.close();
    return { id, name, phoneNumber, balance: balance || 0, businessId };
  }

  static update(id, businessId, { name, phoneNumber, balance }) {
    const db = new Database(config.dbPath);
    db.prepare(`
      UPDATE customers 
      SET name = ?, phoneNumber = ?, balance = ? 
      WHERE id = ? AND businessId = ?
    `).run(name, phoneNumber, balance, id, businessId);
    db.close();
    return { id, name, phoneNumber, balance, businessId };
  }

  static delete(id, businessId) {
    const db = new Database(config.dbPath);
    db.prepare('DELETE FROM transactions WHERE customerId = ? AND businessId = ?')
      .run(id, businessId);
    db.prepare('DELETE FROM customers WHERE id = ? AND businessId = ?')
      .run(id, businessId);
    db.close();
  }
}