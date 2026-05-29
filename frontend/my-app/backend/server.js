import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoutes from "./routes/users.js";
import orderRoutes from "./routes/orders.js";
import authRoutes from "./routes/auth.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import User from "./models/user.js";
import Order from "./models/order.js";
import Transaction from "./models/transactionModel.js";
import { optionalAuth } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",") : []),
];

// =============================
// Middleware
// =============================
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =============================
// Routes
// =============================
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/budgets", budgetRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", authRoutes);

// =============================
// Dashboard Stats API
// =============================
app.get("/api/stats", optionalAuth, async (req, res) => {
  try {
    const transactionQuery = req.userId
      ? {
          userId: req.userId,
        }
      : {};
    const [users, orders, transactions] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Transaction.find(transactionQuery).sort({
        date: -1,
        createdAt: -1,
      }),
    ]);

    const income = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const expense = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const byMonth = new Map();
    const byCategory = new Map();

    transactions.forEach((item) => {
      const date = new Date(item.date || item.createdAt);
      const month = Number.isNaN(date.getTime())
        ? "Other"
        : date.toLocaleString("en-US", {
            month: "short",
          });
      const currentMonth = byMonth.get(month) || {
        month,
        income: 0,
        expense: 0,
        revenue: 0,
      };

      currentMonth[item.type] += Number(item.amount || 0);
      currentMonth.revenue = currentMonth.income - currentMonth.expense;
      byMonth.set(month, currentMonth);

      if (item.type === "expense") {
        byCategory.set(
          item.category,
          (byCategory.get(item.category) || 0) + Number(item.amount || 0)
        );
      }
    });

    const monthlyData = Array.from(byMonth.values());
    const stats = {
      users,
      revenue: income,
      orders,
      income,
      expense,
      balance: income - expense,
      monthlyData,
      expenseBreakdown: Array.from(byCategory.entries()).map(([name, value]) => ({
        name,
        value,
      })),
      recentTransactions: transactions.slice(0, 6).map((item) => ({
        id: item._id,
        name: item.name,
        type: item.type,
        status: "Completed",
        amount: item.amount,
        category: item.category,
        date: item.date,
      })),
    };

    res.status(200).json(stats);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// =============================
// Test Route
// =============================
app.get("/", (req, res) => {
  res.send("API is running");
});

// =============================
// MongoDB Connection
// =============================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err);
    process.exit(1);
  });

// =============================
// Server Start
// =============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
