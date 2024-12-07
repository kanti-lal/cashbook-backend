import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../config/config.js";
import { getDb } from "../database/db.js";

export class UserModel {
  static async create({ email, password, name, mobile, address, dateOfBirth }) {
    const db = getDb();

    try {
      // Check if user already exists
      const existingUser = db
        .prepare("SELECT * FROM users WHERE email = ?")
        .get(email);
      if (existingUser) {
        throw new Error("User already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Format dateOfBirth to ISO string if it exists
      const formattedDate = dateOfBirth
        ? new Date(dateOfBirth).toISOString().split("T")[0]
        : null;

      // Insert user with new fields
      const result = db
        .prepare(
          `
          INSERT INTO users (email, password, name, mobile, address, dateOfBirth) 
          VALUES (?, ?, ?, ?, ?, ?)
        `
        )
        .run(
          email,
          hashedPassword,
          name,
          mobile || null,
          address || null,
          formattedDate
        );

      return {
        id: result.lastInsertRowid,
        email,
        name,
        mobile,
        address,
        dateOfBirth: formattedDate,
      };
    } catch (error) {
      throw error;
    }
  }

  static async updateProfile(userId, { name, mobile, address, dateOfBirth }) {
    const db = getDb();

    try {
      // Check if user exists
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Format dateOfBirth to ISO string if it exists
      const formattedDate = dateOfBirth
        ? new Date(dateOfBirth).toISOString().split("T")[0]
        : null;

      // Update user profile
      db.prepare(
        `
        UPDATE users 
        SET name = ?, mobile = ?, address = ?, dateOfBirth = ? 
        WHERE id = ?
      `
      ).run(name, mobile || null, address || null, formattedDate, userId);

      return {
        id: userId,
        email: user.email,
        name,
        mobile,
        address,
        dateOfBirth: formattedDate,
      };
    } catch (error) {
      throw error;
    }
  }

  static getById(id) {
    const db = getDb();
    try {
      return db
        .prepare(
          `
          SELECT id, email, name, mobile, address, dateOfBirth 
          FROM users WHERE id = ?
        `
        )
        .get(id);
    } catch (error) {
      throw error;
    }
  }

  static async login({ email, password }) {
    const db = getDb();

    try {
      // Find user
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        throw new Error("Invalid password");
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: "24h" }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  static async createResetToken(email) {
    const db = new Database(config.dbPath);

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    // Save reset token
    db.prepare(
      `
      UPDATE users 
      SET resetToken = ?, resetTokenExpiry = ? 
      WHERE id = ?
    `
    ).run(resetToken, resetTokenExpiry, user.id);

    db.close();
    return { resetToken, email };
  }

  static async resetPassword({ token, password }) {
    const db = new Database(config.dbPath);

    // Find user with valid reset token
    const user = db
      .prepare(
        `
      SELECT * FROM users 
      WHERE resetToken = ? AND resetTokenExpiry > ?
    `
      )
      .get(token, new Date().toISOString());

    if (!user) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear reset token
    db.prepare(
      `
      UPDATE users 
      SET password = ?, resetToken = NULL, resetTokenExpiry = NULL 
      WHERE id = ?
    `
    ).run(hashedPassword, user.id);

    db.close();
    return true;
  }

  static async updatePassword(userId, { currentPassword, newPassword }) {
    const db = new Database(config.dbPath);

    // Find user
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(
      hashedPassword,
      userId
    );

    db.close();
    return true;
  }
}
