const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { verifyToken } = require("../middleware/auth");

// 📌 Tạo link thanh toán PayOS
router.post(
  "/create-payment-link",
  verifyToken,
  paymentController.createPaymentLink
);

// 📌 Lấy thông tin thanh toán từ PayOS
router.get(
  "/get-payment-link-information",
  verifyToken,
  paymentController.getPaymentLinkInformation
);

// Webhook nhận phản hồi từ PayOS
router.post("/webhook/payos", paymentController.handlePayOSWebhook);

module.exports = router;
