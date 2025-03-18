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

// Webhook nhận phản hồi từ PayOS thành công
router.get(
  "/webhook/payos/success",
  paymentController.handlePayOSWebhookSuccess
);

// Webhook nhận phản hồi từ PayOS thất bại
router.get("/webhook/payos/fail", paymentController.handlePayOSWebhookFail);

module.exports = router;
