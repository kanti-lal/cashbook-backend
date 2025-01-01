import express from "express";
import { UserModel } from "../models/userModel.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await UserModel.adminLogin({ email, password });
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Get all users (protected)
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Block user (protected)
router.post("/users/:id/block", adminAuth, async (req, res) => {
  try {
    const success = await UserModel.blockUser(req.params.id);
    if (success) {
      res.json({ message: "User blocked successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unblock user (protected)
router.post("/users/:id/unblock", adminAuth, async (req, res) => {
  try {
    const success = await UserModel.unblockUser(req.params.id);
    if (success) {
      res.json({ message: "User unblocked successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user (protected)
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const success = await UserModel.deleteUser(req.params.id);
    if (success) {
      res.json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
