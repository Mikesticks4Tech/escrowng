const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");

router.post("/initialize/:id", auth, paymentController.initializePayment);
router.get("/verify/:reference", paymentController.verifyPayment);
router.post("/release/:id", auth, paymentController.releaseFunds);
router.post("/webhook", paymentController.webhook);

module.exports = router;
