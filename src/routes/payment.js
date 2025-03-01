const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { verifyToken } = require("../middleware/auth");

router.post(
  "/create-payment-link",
  verifyToken,
  paymentController.createPaymentLink
);
router.get(
  "/get-payment-link-information",
  verifyToken,
  paymentController.getPaymentLinkInformation
);

router.post(
  "/cancel-payment-link",
  verifyToken,
  paymentController.cancelPaymentLink
);

module.exports = router;
