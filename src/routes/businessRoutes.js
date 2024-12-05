import express from "express";
import { body, validationResult } from "express-validator";
import { BusinessModel } from "../models/businessModel.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const businesses = BusinessModel.getAll();
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/",
  [
    body("id").notEmpty(),
    body("name").notEmpty(),
    body("createdAt").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const business = BusinessModel.create(req.body);
      res.status(201).json(business);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
