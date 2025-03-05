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

    return res.status(200).json({
      message: "Order hàng được tạo thành công, hãy chờ hàng được giao đến",
      result,
    });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderService.getUserOrders(userId);
    res.status(200).json({ message: "Xem order của user thành công", orders });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(400).json({ message: error.message });
  }
};

const getOrderDetail = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id; // Lấy userId từ token đã đăng nhập

    // Gọi service để lấy order
    const order = await orderService.getOrderById(orderId, userId);

    res
      .status(200)
      .json({ message: "Xem thông tin của order thành công", order });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(403).json({ error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const userId = req.user.id; // Lấy userId từ token

    // Gọi service để hủy order
    const order = await orderService.cancelOrder(orderId, userId);

    res.status(200).json({ message: "Hủy order thành công", order });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(403).json({ error: error.message });
  }
};

const updateShippingStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const result = await orderService.updateShippingStatus(orderId, status);
    return res
      .status(200)
      .json({ message: "Cập nhật trạng thái giao hàng", result });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    return res.status(500).json({ error: error.message });
  }
};

const getPendingShipments = async (req, res) => {
  try {
    const result = await orderService.getPendingShipments();
    return res
      .status(200)
      .json({
        message: "Lấy danh sách đơn hàng chưa ship thành công",
        orders: result,
      });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
  updateShippingStatus,
  getPendingShipments,
};
