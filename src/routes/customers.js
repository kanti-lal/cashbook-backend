import express from "express";
import { body, validationResult } from "express-validator";
import { CustomerModel } from "../models/customerModel.js";

const router = express.Router();

// Get all customers
router.get("/", (req, res) => {
  try {
    const customers = CustomerModel.getAll();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer by ID with balance
router.get("/:id", (req, res) => {
  try {
    const customer = CustomerModel.getById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    const balance = CustomerModel.getBalance(req.params.id);
    res.json({ ...customer, balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer
router.post(
  "/",
  [
    body("name").notEmpty().trim(),
    body("phone").optional().trim(),
    body("address").optional().trim(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customerId = CustomerModel.create(req.body);
      res.status(201).json({ id: customerId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
