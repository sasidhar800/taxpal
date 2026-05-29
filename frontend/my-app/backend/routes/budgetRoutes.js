import express from "express";
import Budget from "../models/budgetModel.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(requireAuth);

const normalizeBudgetPayload = (body = {}) => {
  const category = body.category?.trim();
  const limit = Number(body.limit);
  const spent = Number(body.spent || 0);

  return {
    category,
    limit,
    spent,
  };
};

const validateBudgetPayload = ({ category, limit, spent }) => {
  if (!category) {
    return "Category is required";
  }

  if (!Number.isFinite(limit) || limit < 0) {
    return "Budget limit must be a valid positive amount";
  }

  if (!Number.isFinite(spent) || spent < 0) {
    return "Spent amount must be a valid positive amount";
  }

  return "";
};

router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({
      userId: req.userId,
    }).sort({
      updatedAt: -1,
    });

    return res.json(budgets);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to load budgets",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = normalizeBudgetPayload(req.body);
    const validationError = validateBudgetPayload(payload);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const budget = await Budget.create({
      ...payload,
      userId: req.userId,
    });

    return res.status(201).json({
      message: "Budget saved successfully",
      budget,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to save budget",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const payload = normalizeBudgetPayload(req.body);
    const validationError = validateBudgetPayload(payload);

    if (validationError) {
      return res.status(400).json({
        message: validationError,
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      payload,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    return res.json({
      message: "Budget updated successfully",
      budget,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to update budget",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!budget) {
      return res.status(404).json({
        message: "Budget not found",
      });
    }

    return res.json({
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Failed to delete budget",
    });
  }
});

export default router;
