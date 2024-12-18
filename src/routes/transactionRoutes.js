import express from "express";
import { body, validationResult } from "express-validator";
import { TransactionModel } from "../models/transactionModel.js";

const router = express.Router();

// Get all transactions with filters
router.get("/:businessId/transactions", (req, res) => {
  try {
    const transactions = TransactionModel.getAll(
      req.params.businessId,
      req.query
    );
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction by ID
router.get("/:businessId/transactions/:transactionId", (req, res) => {
  try {
    const transaction = TransactionModel.getById(
      req.params.transactionId,
      req.params.businessId
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
router.post(
  "/:businessId/transactions",
  [
    body("id").notEmpty(),
    body("type").isIn(["IN", "OUT"]),
    body("amount").isFloat({ min: 0.01 }),
    body("category").isIn(["CUSTOMER", "SUPPLIER"]),
    body("paymentMode").isIn(["CASH", "ONLINE"]),
    body("date").notEmpty(),
    body("customerId").optional(),
    body("supplierId").optional(),
    body("description").optional(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const transaction = TransactionModel.create({
        ...req.body,
        businessId: req.params.businessId,
      });
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Update transaction
router.put(
  "/:businessId/transactions/:transactionId",
  [
    body("type").isIn(["IN", "OUT"]),
    body("amount").isFloat({ min: 0.01 }),
    body("category").isIn(["CUSTOMER", "SUPPLIER"]),
    body("paymentMode").isIn(["CASH", "ONLINE"]),
    body("date").notEmpty(),
    body("customerId").optional(),
    body("supplierId").optional(),
    body("description").optional(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const transaction = TransactionModel.update(
        req.params.transactionId,
        req.params.businessId,
        req.body
      );
      res.json(transaction);
    } catch (error) {
      if (error.message === "Transaction not found") {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
);

// Delete transaction
router.delete("/:businessId/transactions/:transactionId", (req, res) => {
  try {
    TransactionModel.delete(req.params.transactionId, req.params.businessId);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get analytics
router.get("/:businessId/analytics", (req, res) => {
  try {
    const analytics = TransactionModel.getAnalytics(req.params.businessId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions by customer ID
router.get("/:businessId/customer-transactions/:customerId", (req, res) => {
  try {
    const transactions = TransactionModel.getTransactionsByCustomerId(
      req.params.customerId,
      req.params.businessId
    );

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        message: "No transactions found for this customer",
      });
    }

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transactions by supplier ID
router.get("/:businessId/supplier-transactions/:supplierId", (req, res) => {
  try {
    const transactions = TransactionModel.getTransactionsBySupplierId(
      req.params.supplierId,
      req.params.businessId
    );

    if (!transactions || transactions.length === 0) {
      return res.status(404).json({
        message: "No transactions found for this supplier",
      });
    }

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
