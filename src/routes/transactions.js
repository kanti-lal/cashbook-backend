import express from 'express';
import { body, validationResult } from 'express-validator';
import { TransactionModel } from '../models/transactionModel.js';

const router = express.Router();

// Get all transactions for a customer
router.get('/:customerId', (req, res) => {
  try {
    const transactions = TransactionModel.getAll(req.params.customerId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new transaction
router.post('/',
  [
    body('customer_id').isInt(),
    body('amount').isFloat({ min: 0.01 }),
    body('type').isIn(['credit', 'debit']),
    body('description').optional().trim()
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const transactionId = TransactionModel.create(req.body);
      res.status(201).json({ id: transactionId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;