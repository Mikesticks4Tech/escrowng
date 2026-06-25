const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const auth = require("../middleware/auth");

router.post("/", auth, transactionController.createTransaction);
router.get("/", auth, transactionController.getMyTransactions);
router.get("/:id", auth, transactionController.getTransaction);
router.put("/:id/accept", auth, transactionController.acceptTransaction);
router.put("/:id/deliver", auth, transactionController.markDelivered);
router.put("/:id/confirm", auth, transactionController.confirmDelivery);
router.put("/:id/dispute", auth, transactionController.raiseDispute);

module.exports = router;
