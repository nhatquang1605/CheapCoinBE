const orderService = require("../services/order.service");

const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethod, shippingAddress } = req.body;

    const result = await orderService.createOrder(
      userId,
      paymentMethod,
      shippingAddress
    );

    return res.status(400).json({
      message: "Order hàng được tạo thành công, hãy chờ hàng được giao đến",
      result,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getUserOrders(userId);
    res.json({ orders });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id; // Lấy userId từ token đã đăng nhập

    // Gọi service để lấy order
    const order = await orderService.getOrderById(orderId, userId);

    res.status(200).json(order);
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id; // Lấy userId từ token

    // Gọi service để hủy order
    const order = await orderService.cancelOrder(orderId, userId);

    res.status(200).json({ message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(403).json({ error: error.message });
  }
};

const payOrder = async (req, res) => {
  try {
    const order = await orderService.payOrder(req.params.orderId, req.user.id);
    res.json({ message: "Order paid successfully", order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
  payOrder,
};
