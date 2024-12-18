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

  // static create(transaction) {
  //   const db = new Database(config.dbPath);

  //   try {
  //     db.prepare("BEGIN TRANSACTION").run();

  //     // Insert transaction
  //     db.prepare(
  //       `
  //           INSERT INTO transactions
  //           (id, type, amount, customerId, supplierId, description, date, category, paymentMode, businessId)
  //           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  //       `
  //     ).run(
  //       transaction.id,
  //       transaction.type,
  //       transaction.amount,
  //       transaction.customerId,
  //       transaction.supplierId,
  //       transaction.description,
  //       transaction.date,
  //       transaction.category,
  //       transaction.paymentMode,
  //       transaction.businessId
  //     );

  //     // Update balance based on transaction type
  //     if (transaction.customerId) {
  //       const balanceChange =
  //         transaction.type === "IN"
  //           ? transaction.amount // Customer pays (IN): Reduce their debt
  //           : -transaction.amount; // Customer receives (OUT): Increase their debt

  //       db.prepare(
  //         `
  //               UPDATE customers
  //               SET balance = balance - ?
  //               WHERE id = ? AND businessId = ?
  //           `
  //       ).run(balanceChange, transaction.customerId, transaction.businessId);
  //     } else if (transaction.supplierId) {
  //       const balanceChange =
  //         transaction.type === "IN"
  //           ? -transaction.amount // Supplier pays us (IN): Reduce our debt
  //           : transaction.amount; // We pay supplier (OUT): Increase our debt

  //       db.prepare(
  //         `
  //               UPDATE suppliers
  //               SET balance = balance - ?
  //               WHERE id = ? AND businessId = ?
  //           `
  //       ).run(balanceChange, transaction.supplierId, transaction.businessId);
  //     }

  //     db.prepare("COMMIT").run();
  //     return transaction;
  //   } catch (error) {
  //     db.prepare("ROLLBACK").run();
  //     throw error;
  //   } finally {
  //     db.close();
  //   }
  // }

  static create(transaction) {
    const db = new Database(config.dbPath);

    try {
      db.prepare("BEGIN TRANSACTION").run();

      // Insert transaction
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

      // Update balance based on transaction type
      if (transaction.customerId) {
        const balanceChange =
          transaction.type === "IN"
            ? transaction.amount // Customer pays us (IN), increase their balance
            : -transaction.amount; // We give to customer (OUT), decrease their balance

        db.prepare(
          `
          UPDATE customers 
          SET balance = balance + ? 
          WHERE id = ? AND businessId = ?
        `
        ).run(balanceChange, transaction.customerId, transaction.businessId);
      } else if (transaction.supplierId) {
        const balanceChange =
          transaction.type === "IN"
            ? transaction.amount // Supplier gives us money (IN), reduce our debt
            : -transaction.amount; // We pay supplier (OUT), increase our debt

        db.prepare(
          `
          UPDATE suppliers 
          SET balance = balance + ? 
          WHERE id = ? AND businessId = ?
        `
        ).run(balanceChange, transaction.supplierId, transaction.businessId);
      }

      db.prepare("COMMIT").run();
      return this.getById(transaction.id, transaction.businessId);
    } catch (error) {
      db.prepare("ROLLBACK").run();
      throw error;
    } finally {
      db.close();
    }
  }

  static update(id, businessId, updates) {
    const db = new Database(config.dbPath);

    try {
      db.prepare("BEGIN TRANSACTION").run();

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

      // Reverse original balance changes
      if (originalTransaction.customerId) {
        const reverseChange =
          originalTransaction.type === "IN"
            ? -originalTransaction.amount // Reverse customer payment
            : originalTransaction.amount; // Reverse money given to customer

        db.prepare(
          `
                UPDATE customers 
                SET balance = balance - ? 
                WHERE id = ? AND businessId = ?
            `
        ).run(reverseChange, originalTransaction.customerId, businessId);
      } else if (originalTransaction.supplierId) {
        const reverseChange =
          originalTransaction.type === "IN"
            ? originalTransaction.amount // Reverse supplier payment
            : -originalTransaction.amount; // Reverse payment to supplier

        db.prepare(
          `
                UPDATE suppliers 
                SET balance = balance - ? 
                WHERE id = ? AND businessId = ?
            `
        ).run(reverseChange, originalTransaction.supplierId, businessId);
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
        const newChange =
          updates.type === "IN"
            ? updates.amount // New customer payment
            : -updates.amount; // New money given to customer

        db.prepare(
          `
                UPDATE customers 
                SET balance = balance - ? 
                WHERE id = ? AND businessId = ?
            `
        ).run(newChange, updates.customerId, businessId);
      } else if (updates.supplierId) {
        const newChange =
          updates.type === "IN"
            ? -updates.amount // New supplier payment
            : updates.amount; // New payment to supplier

        db.prepare(
          `
                UPDATE suppliers 
                SET balance = balance - ? 
                WHERE id = ? AND businessId = ?
            `
        ).run(newChange, updates.supplierId, businessId);
      }

      db.prepare("COMMIT").run();
      return this.getById(id, businessId);
    } catch (error) {
      db.prepare("ROLLBACK").run();
      throw error;
    } finally {
      db.close();
    }
  }

  static delete(id, businessId) {
    const db = new Database(config.dbPath);

    try {
      db.prepare("BEGIN TRANSACTION").run();

      // Get transaction before deletion
      const transaction = db
        .prepare(
          `
            SELECT * FROM transactions 
            WHERE id = ? AND businessId = ?
        `
        )
        .get(id, businessId);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Reverse the balance changes
      if (transaction.customerId) {
        const reverseChange =
          transaction.type === "IN"
            ? transaction.amount // Reverse customer payment (add back to balance)
            : -transaction.amount; // Reverse money given (subtract from balance)

        db.prepare(
          `
                UPDATE customers 
                SET balance = balance - ? 
                WHERE id = ? AND businessId = ?
            `
        ).run(reverseChange, transaction.customerId, businessId);
      } else if (transaction.supplierId) {
        const reverseChange =
          transaction.type === "IN"
            ? transaction.amount // Reverse supplier payment
            : -transaction.amount; // Reverse payment to supplier

        db.prepare(
          `
                UPDATE suppliers 
                SET balance = balance - ? 
                WHERE id = ? AND businessId = ?
            `
        ).run(reverseChange, transaction.supplierId, businessId);
      }

      // Delete the transaction
      db.prepare(
        `
            DELETE FROM transactions 
            WHERE id = ? AND businessId = ?
        `
      ).run(id, businessId);

      db.prepare("COMMIT").run();
    } catch (error) {
      db.prepare("ROLLBACK").run();
      throw error;
    } finally {
      db.close();
    }
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

  static getTransactionsByCustomerId(customerId, businessId) {
    const db = new Database(config.dbPath);
    const transactions = db
      .prepare(
        `
      SELECT 
        t.*,
        c.name as customerName,
        c.phoneNumber as customerPhone
      FROM transactions t
      LEFT JOIN customers c ON t.customerId = c.id
      WHERE t.customerId = ? AND t.businessId = ?
      ORDER BY t.date DESC
    `
      )
      .all(customerId, businessId);

    db.close();
    return transactions;
  }

  static getTransactionsBySupplierId(supplierId, businessId) {
    const db = new Database(config.dbPath);
    const transactions = db
      .prepare(
        `
      SELECT 
        t.*,
        s.name as supplierName,
        s.phoneNumber as supplierPhone
      FROM transactions t
      LEFT JOIN suppliers s ON t.supplierId = s.id
      WHERE t.supplierId = ? AND t.businessId = ?
      ORDER BY t.date DESC
    `
      )
      .all(supplierId, businessId);

    db.close();
    return transactions;
  }
}
