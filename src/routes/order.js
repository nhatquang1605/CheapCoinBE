const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/create", verifyToken, orderController.createOrder);
router.get("/", verifyToken, orderController.getUserOrders);
router.get("/:orderId", verifyToken, orderController.getOrderDetail);
router.put("/:orderId/cancel", verifyToken, orderController.cancelOrder);
// Xử lý giao hàng
router.put(
  "/:orderId/shipping-status",
  verifyToken,
  orderController.updateShippingStatus
);
router.get(
  "/pending-shipments",
  verifyToken,
  orderController.getPendingShipments
);


// Thêm routes cho Admin hải thêm vào
router.get("/admin/all", verifyToken, orderController.getAllOrders);
router.put("/admin/:orderId/status", verifyToken, orderController.updateOrderStatus);
router.get("/admin/analytics", verifyToken, orderController.getOrderAnalytics);
module.exports = router;
