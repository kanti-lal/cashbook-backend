import express from "express";
import { body, validationResult } from "express-validator";
import { SupplierModel } from "../models/supplierModel.js";

const router = express.Router();

router.get("/:businessId/suppliers", (req, res) => {
  try {
    const suppliers = SupplierModel.getAll(
      req.params.businessId,
      req.query.search
    );
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:businessId/suppliers/:supplierId", (req, res) => {
  try {
    const supplier = SupplierModel.getById(
      req.params.supplierId,
      req.params.businessId
    );
    if (!supplier) {
      return res.status(404).json({ error: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/:businessId/suppliers",
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
      const supplier = SupplierModel.create({
        ...req.body,
        businessId: req.params.businessId,
      });
      res.status(201).json(supplier);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.put(
  "/:businessId/suppliers/:supplierId",
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
      const supplier = SupplierModel.update(
        req.params.supplierId,
        req.params.businessId,
        req.body
      );
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.delete("/:businessId/suppliers/:supplierId", (req, res) => {
  try {
    SupplierModel.delete(req.params.supplierId, req.params.businessId);
    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
