import express from "express";

import Transaction from "../models/transactionModel.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

const buildTransactionPayload = (body) => {
  const name = String(body.name || "").trim();
  const type = String(body.type || "").trim().toLowerCase();
  const amount = Number(body.amount);
  const category = String(body.category || "").trim();
  const date = String(body.date || "").trim();

  if (!name || !type || !category || !date) {
    return {
      error:
        "Name, type, category, and date are required",
    };
  }

  if (!["income", "expense"].includes(type)) {
    return {
      error:
        "Type must be either income or expense",
    };
  }

  if (!Number.isFinite(amount) || amount < 0) {
    return {
      error:
        "Amount must be a valid non-negative number",
    };
  }

  return {
    data: {
      name,
      type,
      amount,
      category,
      date,
    },
  };
};

router.use(requireAuth);


// =========================
// GET ALL
// =========================

router.get("/", async (req, res) => {

  try {

    const transactions =
      await Transaction.find({
        userId: req.userId,
      }).sort({
        createdAt: -1,
      });

    res.status(200).json(
      transactions
    );

  } catch (error) {

    res.status(500).json({
      message:
        "Failed to fetch transactions",
    });
  }
});


// =========================
// ADD
// =========================

router.post("/", async (req, res) => {

  try {

    const { data, error } =
      buildTransactionPayload(req.body);

    if (error) {
      return res.status(400).json({
        message: error,
      });
    }

    const transaction =
      new Transaction({
        ...data,
        userId: req.userId,
      });

    await transaction.save();

    res.status(201).json({
      message:
        "Transaction added successfully",
      transaction,
    });

  } catch (error) {

    console.error(
      "Failed to add transaction:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to add transaction",
    });
  }
});


// =========================
// UPDATE
// =========================

router.put("/:id", async (req, res) => {

  try {

    const { data, error } =
      buildTransactionPayload(req.body);

    if (error) {
      return res.status(400).json({
        message: error,
      });
    }

    const updatedTransaction =
      await Transaction.findOneAndUpdate(
        {
          _id: req.params.id,
          userId: req.userId,
        },
        {
          ...data,
          userId: req.userId,
        },
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedTransaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      message:
        "Transaction updated successfully",
      updatedTransaction,
    });

  } catch (error) {

    console.error(
      "Failed to update transaction:",
      error.message
    );

    res.status(500).json({
      message:
        "Failed to update transaction",
    });
  }
});


// =========================
// DELETE
// =========================

router.delete("/:id", async (req, res) => {

  try {

    const deletedTransaction =
      await Transaction.findOneAndDelete({
        _id: req.params.id,
        userId: req.userId,
      });

    if (!deletedTransaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      message:
        "Transaction deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      message:
        "Failed to delete transaction",
    });
  }
});

export default router;
