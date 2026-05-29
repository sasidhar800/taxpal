import mongoose from "mongoose";

const transactionSchema =
  new mongoose.Schema({

    name: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    amount: {
      type: Number,
      min: 0,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
    },

  },

  {
    timestamps: true,
  }
);

const Transaction =
  mongoose.model(
    "Transaction",
    transactionSchema
  );

export default Transaction;
