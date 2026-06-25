const paystackRequest = require("../utils/paystack");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Initialize payment - buyer pays into escrow
exports.initializePayment = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "buyer",
      "name email",
    );

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.buyer._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the buyer can make payment" });
    }

    if (transaction.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Transaction is not in pending state" });
    }

    const reference = `escrow_${transaction._id}_${Date.now()}`;

    const response = await paystackRequest.post("/transaction/initialize", {
      email: transaction.buyer.email,
      amount: transaction.amount * 100,
      reference,
      metadata: {
        transactionId: transaction._id.toString(),
        buyerId: req.user.id,
      },
      callback_url: `http://localhost:5173/payment/verify`,
    });

    // Save reference to transaction
    transaction.paystackReference = response.data.data.reference;
    await transaction.save();

    res.status(200).json({
      message: "Payment initialized",
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Verify payment after redirect
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;
    console.log("Verifying reference:", reference);

    const response = await paystackRequest.get(
      `/transaction/verify/${reference}`,
    );
    const data = response.data.data;
    console.log("Paystack status:", data.status);

    if (data.status !== "success") {
      return res.status(400).json({ message: "Payment not successful" });
    }

    // Find transaction by reference and update status
    const transaction = await Transaction.findOne({
      paystackReference: reference,
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    transaction.status = "funded";
    await transaction.save();

    res.status(200).json({
      message: "Payment verified, funds in escrow",
      transaction,
    });
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Release funds to seller (called when buyer confirms delivery)
exports.releaseFunds = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "seller",
      "name email",
    );

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.buyer.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Only the buyer can release funds" });
    }

    if (transaction.status !== "delivered") {
      return res
        .status(400)
        .json({ message: "Transaction must be delivered first" });
    }

    // Transfer to seller via Paystack
    const response = await paystackRequest.post("/transfer", {
      source: "balance",
      amount: transaction.amount * 100,
      recipient: transaction.seller.paystackRecipientCode,
      reason: `Escrow release for: ${transaction.title}`,
    });

    transaction.status = "completed";
    await transaction.save();

    res.status(200).json({ message: "Funds released to seller", transaction });
  } catch (err) {
    console.log("ERROR:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Webhook - Paystack calls this automatically after payment
exports.webhook = async (req, res) => {
  try {
    const event = req.body;
    console.log("Webhook event:", event.event);

    if (event.event === "charge.success") {
      const reference = event.data.reference;
      const transaction = await Transaction.findOne({
        paystackReference: reference,
      });

      if (transaction && transaction.status === "pending") {
        transaction.status = "funded";
        await transaction.save();
        console.log("Transaction funded via webhook:", transaction._id);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.log("Webhook error:", err.message);
    res.sendStatus(500);
  }
};
