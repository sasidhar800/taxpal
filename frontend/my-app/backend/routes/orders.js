import express from "express";

import Order from "../models/order.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(requireAuth);

// =========================
// GET ORDERS
// =========================
router.get("/", async (req, res) => {

  try {

    const orders =
      await Order.find();

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// =========================
// ADD ORDER
// =========================
router.post("/", async (req, res) => {

  try {

    const {
      customer,
      product,
      amount,
      status,
    } = req.body;

    const newOrder = new Order({
      customer,
      product,
      amount,
      status,
    });

    await newOrder.save();

    res.status(201).json(newOrder);

  } catch (error) {

    res.status(500).json({
      message: "Error adding order",
    });
  }
});

// =========================
// DELETE ORDER
// =========================
router.delete("/:id", async (req, res) => {

  try {

    await Order.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Order deleted",
    });

  } catch (error) {

    res.status(500).json({
      message: "Delete failed",
    });
  }
});

// =========================
// UPDATE ORDER
// =========================
router.put("/:id", async (req, res) => {

  try {

    const updatedOrder =
      await Order.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json(updatedOrder);

  } catch (error) {

    res.status(500).json({
      message: "Update failed",
    });
  }
});

export default router;
