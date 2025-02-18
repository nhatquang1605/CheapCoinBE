const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/create", verifyToken, orderController.createOrder);
router.get("/", verifyToken, orderController.getUserOrders);
router.get("/:orderId", verifyToken, orderController.getOrderDetail);
router.put("/:orderId/cancel", verifyToken, orderController.cancelOrder);
router.put("/:orderId/pay", verifyToken, orderController.payOrder);

module.exports = router;
