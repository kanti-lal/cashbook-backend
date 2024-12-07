import { getDb } from "../database/db.js";

export class BusinessModel {
  static getAll(userId) {
    const db = getDb();
    return db.prepare("SELECT * FROM businesses WHERE userId = ?").all(userId);
  }

  static create({ id, name, userId, createdAt }) {
    const db = getDb();

    // First verify that the user exists
    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    try {
      const stmt = db.prepare(
        "INSERT INTO businesses (id, name, userId, createdAt) VALUES (?, ?, ?, ?)"
      );
      stmt.run(id, name, userId, createdAt);
      return { id, name, userId, createdAt };
    } catch (error) {
      if (error.message.includes("FOREIGN KEY constraint failed")) {
        throw new Error("Invalid user ID provided");
      }
      throw error;
    }
  }
}
