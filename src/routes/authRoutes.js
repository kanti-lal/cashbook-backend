import express from "express";
import { body, validationResult } from "express-validator";
import { UserModel } from "../models/userModel.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Register new user
router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("name").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await UserModel.create(req.body);
      res.status(201).json(user);
    } catch (error) {
      if (error.message === "User already exists") {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const result = await UserModel.login(req.body);
      res.json(result);
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  }
);

// Get current user
router.get("/me", authenticateToken, (req, res) => {
  try {
    const user = UserModel.getById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
