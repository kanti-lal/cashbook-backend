import express from "express";
import { body, validationResult } from "express-validator";
import { UserModel } from "../models/userModel.js";
import { authenticateToken } from "../middleware/auth.js";
import { sendResetEmail } from "../utils/email.js";

const router = express.Router();

// Register new user
router.post(
  "/register",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("name").notEmpty(),
    body("mobile").optional().isMobilePhone(),
    body("address").optional(),
    body("dateOfBirth").optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = await UserModel.create(req.body);
      res.status(201).json({
        message: "Registration successful. Please login to continue.",
        user,
      });
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

// Request password reset
router.post("/forgot-password", [body("email").isEmail()], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { resetToken, email } = await UserModel.createResetToken(
      req.body.email
    );
    await sendResetEmail(email, resetToken);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Reset password
router.post(
  "/reset-password",
  [body("token").notEmpty(), body("password").isLength({ min: 6 })],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await UserModel.resetPassword(req.body);
      res.json({ message: "Password reset successful" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Update password
router.post(
  "/update-password",
  authenticateToken,
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      await UserModel.updatePassword(req.user.id, req.body);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// Add new route for profile update
router.put(
  "/profile",
  authenticateToken,
  [
    body("name").notEmpty(),
    body("mobile").optional().isMobilePhone(),
    body("address").optional(),
    body("dateOfBirth").optional().isISO8601().toDate(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const updatedUser = await UserModel.updateProfile(req.user.id, req.body);
      res.json(updatedUser);
    } catch (error) {
      if (error.message === "User not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: error.message });
    }
  }
);

export default router;
