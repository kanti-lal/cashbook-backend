import express from "express";
import { body, validationResult } from "express-validator";
import { CustomerModel } from "../models/customerModel.js";

const router = express.Router();

router.get("/:businessId/customers", (req, res) => {
  try {
    const customers = CustomerModel.getAll(
      req.params.businessId,
      req.query.search
    );
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:businessId/customers/:customerId", (req, res) => {
  try {
    const customer = CustomerModel.getById(
      req.params.customerId,
      req.params.businessId
    );
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/:businessId/customers",
  [
    body("id").notEmpty(),
    body("name").notEmpty(),
    body("phoneNumber").notEmpty(),
    body("balance").optional().isNumeric(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customer = CustomerModel.create({
        ...req.body,
        businessId: req.params.businessId,
      });
      res.status(201).json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  "/:businessId/customers/:customerId",
  [
    body("name").notEmpty(),
    body("phoneNumber").notEmpty(),
    body("balance").isNumeric(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const customer = CustomerModel.update(
        req.params.customerId,
        req.params.businessId,
        req.body
      );
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete("/:businessId/customers/:customerId", (req, res) => {
  try {
    CustomerModel.delete(req.params.customerId, req.params.businessId);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
