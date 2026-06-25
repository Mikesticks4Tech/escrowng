const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Create a new transaction (buyer)
exports.createTransaction = async (req, res) => {
  try {
    const { title, description, amount, sellerEmail } = req.body;

    // Make sure buyer is not the seller
    const buyer = await User.findById(req.user.id);
    if (buyer.email === sellerEmail) {
      return res
        .status(400)
        .json({ message: "You cannot be both buyer and seller" });
    }

    const transaction = new Transaction({
      title,
      description,
      amount,
      sellerEmail,
      buyer: req.user.id,
      status: "pending",
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all transactions for logged in user
exports.getMyTransactions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const transactions = await Transaction.find({
      $or: [
        { buyer: req.user.id },
        { seller: req.user.id },
        { sellerEmail: user.email },
      ],
    })
      .populate("buyer", "name email")
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("seller", "name email");

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    res.status(200).json(transaction);
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Seller accepts transaction
exports.acceptTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    const seller = await User.findById(req.user.id);
    if (seller.email !== transaction.sellerEmail) {
      return res
        .status(403)
        .json({ message: "You are not the seller for this transaction" });
    }

    transaction.seller = req.user.id;
    transaction.status = "pending";
    await transaction.save();

    const updated = await Transaction.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("seller", "name email");

    res
      .status(200)
      .json({ message: "Transaction accepted", transaction: updated });
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Seller marks as delivered
exports.markDelivered = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.seller.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the seller can mark as delivered" });
    }

    if (transaction.status !== "funded") {
      return res
        .status(400)
        .json({ message: "Transaction must be funded before delivery" });
    }

    transaction.status = "delivered";
    await transaction.save();

    res.status(200).json({ message: "Marked as delivered", transaction });
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Buyer confirms delivery - release funds
exports.confirmDelivery = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.buyer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the buyer can confirm delivery" });
    }

    if (transaction.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Transaction must be marked delivered first" });
    }

    transaction.status = "completed";
    await transaction.save();

    res
      .status(200)
      .json({ message: "Delivery confirmed, funds released", transaction });
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Buyer raises dispute
exports.raiseDispute = async (req, res) => {
  try {
    const { reason } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.buyer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the buyer can raise a dispute" });
    }

    if (transaction.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Can only dispute a delivered transaction" });
    }

    transaction.status = "disputed";
    transaction.disputeReason = reason;
    await transaction.save();

    res.status(200).json({ message: "Dispute raised", transaction });
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
