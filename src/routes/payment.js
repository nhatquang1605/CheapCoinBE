const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { verifyToken } = require("../middleware/auth");

router.post(
  "/create-payment-link",
  verifyToken,
  paymentController.createPaymentLink
);

module.exports = router;
