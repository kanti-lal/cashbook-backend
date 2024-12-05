import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

export class UserModel {
  static async create({ email, password, name }) {
    const db = new Database(config.dbPath);

    // Check if user already exists
    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db
      .prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)")
      .run(email, hashedPassword, name);

    db.close();
    return { id: result.lastInsertRowid, email, name };
  }

  static async login({ email, password }) {
    const db = new Database(config.dbPath);

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
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    db.close();
    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  static getById(id) {
    const db = new Database(config.dbPath);
    const user = db
      .prepare("SELECT id, email, name FROM users WHERE id = ?")
      .get(id);
    db.close();
    return user;
  }
}
