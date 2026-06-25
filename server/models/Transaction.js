const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sellerEmail: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "funded",
        "delivered",
        "completed",
        "disputed",
        "resolved",
      ],
      default: "pending",
    },
    paystackReference: { type: String },
    disputeReason: { type: String },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Transaction", transactionSchema);
