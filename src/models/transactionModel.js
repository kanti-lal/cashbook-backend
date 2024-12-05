import Database from "better-sqlite3";
import { config } from "../config/config.js";

export class TransactionModel {
  static getAll(
    businessId,
    { search, startDate, endDate, type, category, paymentMode } = {}
  ) {
    const db = new Database(config.dbPath);

    let query = "SELECT * FROM transactions WHERE businessId = ?";
    const params = [businessId];

    if (startDate) {
      query += " AND date >= ?";
      params.push(startDate);
    }
    if (endDate) {
      query += " AND date <= ?";
      params.push(endDate);
    }
    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    if (category) {
      query += " AND category = ?";
      params.push(category);
    }
    if (paymentMode) {
      query += " AND paymentMode = ?";
      params.push(paymentMode);
    }

    const transactions = db.prepare(query).all(...params);
    db.close();
    return transactions;
  }

  static getById(id, businessId) {
    const db = new Database(config.dbPath);
    const transaction = db
      .prepare(
        `
      SELECT 
        t.*,
        CASE 
          WHEN t.customerId IS NOT NULL THEN c.name
          WHEN t.supplierId IS NOT NULL THEN s.name
          ELSE NULL
        END as partyName,
        CASE 
          WHEN t.customerId IS NOT NULL THEN c.phoneNumber
          WHEN t.supplierId IS NOT NULL THEN s.phoneNumber
          ELSE NULL
        END as partyPhone
      FROM transactions t
      LEFT JOIN customers c ON t.customerId = c.id
      LEFT JOIN suppliers s ON t.supplierId = s.id
      WHERE t.id = ? AND t.businessId = ?
    `
      )
      .get(id, businessId);

    db.close();
    return transaction;
  }

  static create(transaction) {
    const db = new Database(config.dbPath);

    db.prepare(
      `
      INSERT INTO transactions 
      (id, type, amount, customerId, supplierId, description, date, category, paymentMode, businessId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    ).run(
      transaction.id,
      transaction.type,
      transaction.amount,
      transaction.customerId,
      transaction.supplierId,
      transaction.description,
      transaction.date,
      transaction.category,
      transaction.paymentMode,
      transaction.businessId
    );

    // Update balance
    if (transaction.customerId) {
      const balanceChange =
        transaction.type === "IN" ? -transaction.amount : transaction.amount;
      db.prepare(
        `
        UPDATE customers 
        SET balance = balance + ? 
        WHERE id = ? AND businessId = ?
      `
      ).run(balanceChange, transaction.customerId, transaction.businessId);
    } else if (transaction.supplierId) {
      const balanceChange =
        transaction.type === "IN" ? -transaction.amount : transaction.amount;
      db.prepare(
        `
        UPDATE suppliers 
        SET balance = balance + ? 
        WHERE id = ? AND businessId = ?
      `
      ).run(balanceChange, transaction.supplierId, transaction.businessId);
    }

    db.close();
    return transaction;
  }

  static update(id, businessId, updates) {
    const db = new Database(config.dbPath);

    // Get original transaction
    const originalTransaction = db
      .prepare(
        `
      SELECT * FROM transactions WHERE id = ? AND businessId = ?
    `
      )
      .get(id, businessId);

    if (!originalTransaction) {
      throw new Error("Transaction not found");
    }

    // Revert original balance changes
    if (originalTransaction.customerId) {
      const balanceChange =
        originalTransaction.type === "IN"
          ? originalTransaction.amount
          : -originalTransaction.amount;
      db.prepare(
        `
        UPDATE customers 
        SET balance = balance + ? 
        WHERE id = ? AND businessId = ?
      `
      ).run(balanceChange, originalTransaction.customerId, businessId);
    } else if (originalTransaction.supplierId) {
      const balanceChange =
        originalTransaction.type === "IN"
          ? originalTransaction.amount
          : -originalTransaction.amount;
      db.prepare(
        `
        UPDATE suppliers 
        SET balance = balance + ? 
        WHERE id = ? AND businessId = ?
      `
      ).run(balanceChange, originalTransaction.supplierId, businessId);
    }

    // Update transaction
    db.prepare(
      `
      UPDATE transactions 
      SET type = ?, amount = ?, customerId = ?, supplierId = ?, 
          description = ?, date = ?, category = ?, paymentMode = ?
      WHERE id = ? AND businessId = ?
    `
    ).run(
      updates.type,
      updates.amount,
      updates.customerId,
      updates.supplierId,
      updates.description,
      updates.date,
      updates.category,
      updates.paymentMode,
      id,
      businessId
    );

    // Apply new balance changes
    if (updates.customerId) {
      const balanceChange =
        updates.type === "IN" ? -updates.amount : updates.amount;
      db.prepare(
        `
        UPDATE customers 
        SET balance = balance + ? 
        WHERE id = ? AND businessId = ?
      `
      ).run(balanceChange, updates.customerId, businessId);
    } else if (updates.supplierId) {
      const balanceChange =
        updates.type === "IN" ? -updates.amount : updates.amount;
      db.prepare(
        `
        UPDATE suppliers 
        SET balance = balance + ? 
        WHERE id = ? AND businessId = ?
      `
      ).run(balanceChange, updates.supplierId, businessId);
    }

    const updatedTransaction = this.getById(id, businessId);
    db.close();
    return updatedTransaction;
  }

  static delete(id, businessId) {
    const db = new Database(config.dbPath);

    const transaction = db
      .prepare(
        `
      SELECT * FROM transactions WHERE id = ? AND businessId = ?
    `
      )
      .get(id, businessId);

    if (transaction) {
      if (transaction.customerId) {
        const balanceChange =
          transaction.type === "IN" ? transaction.amount : -transaction.amount;
        db.prepare(
          `
          UPDATE customers 
          SET balance = balance + ? 
          WHERE id = ? AND businessId = ?
        `
        ).run(balanceChange, transaction.customerId, businessId);
      } else if (transaction.supplierId) {
        const balanceChange =
          transaction.type === "IN" ? transaction.amount : -transaction.amount;
        db.prepare(
          `
          UPDATE suppliers 
          SET balance = balance + ? 
          WHERE id = ? AND businessId = ?
        `
        ).run(balanceChange, transaction.supplierId, businessId);
      }

      db.prepare(
        "DELETE FROM transactions WHERE id = ? AND businessId = ?"
      ).run(id, businessId);
    }

    db.close();
  }

  static getAnalytics(businessId) {
    const db = new Database(config.dbPath);

    const transactions = db
      .prepare(
        `
      SELECT 
        strftime('%Y-%m', date) as month,
        paymentMode,
        SUM(CASE WHEN type = 'IN' THEN amount ELSE 0 END) as totalIn,
        SUM(CASE WHEN type = 'OUT' THEN amount ELSE 0 END) as totalOut
      FROM transactions 
      WHERE businessId = ?
      GROUP BY strftime('%Y-%m', date), paymentMode
      ORDER BY month
    `
      )
      .all(businessId);

    db.close();

    // Group by month and include payment mode totals
    const analytics = {};
    transactions.forEach((t) => {
      if (!analytics[t.month]) {
        analytics[t.month] = {
          month: t.month,
          cash: { totalIn: 0, totalOut: 0 },
          online: { totalIn: 0, totalOut: 0 },
          totalIn: 0,
          totalOut: 0,
        };
      }

      const mode = t.paymentMode.toLowerCase();
      analytics[t.month][mode].totalIn += t.totalIn;
      analytics[t.month][mode].totalOut += t.totalOut;
      analytics[t.month].totalIn += t.totalIn;
      analytics[t.month].totalOut += t.totalOut;
    });

    return Object.values(analytics).map((month) => ({
      ...month,
      balance: month.totalIn - month.totalOut,
    }));
  }
}
