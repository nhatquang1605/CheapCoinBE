const orderService = require("../services/order.service");
const Order = require("../models/order.model")
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

//3 hàm dưới kể từ ---- là hải thêm vào 
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "email")
      .populate("orderItems");
      
    return res.status(200).json({
      message: "Lấy tất cả đơn hàng thành công",
      orders: orders
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Kiểm tra trạng thái hợp lệ
    const validStatuses = ["pending", "done", "cancelled", "payment_fail"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    
    // Cập nhật trạng thái
    order.status = status;
    
    // Cập nhật trạng thái phụ thuộc
    if (status === "done") {
      order.shippingStatus = "delivered";
      if (order.paymentMethod === "cash") {
        order.paymentStatus = "paid";
      }
    } else if (status === "cancelled") {
      order.shippingStatus = "cancelled";
      if (order.paymentStatus === "paid") {
        order.paymentStatus = "refunded";
      }
    }
    
    await order.save();
    
    return res.status(200).json({
      message: "Cập nhật trạng thái đơn hàng thành công",
      order: order
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

const getOrderAnalytics = async (req, res) => {
  try {
    // Thống kê tổng số đơn hàng theo trạng thái
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" }
        }
      }
    ]);
    
    // Thống kê đơn hàng theo tháng
    const monthlyOrders = await Order.aggregate([
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
          totalPrice: 1,
          status: 1
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "done"] }, 1, 0]
            }
          },
          cancelled: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0]
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    return res.status(200).json({
      message: "Lấy dữ liệu thống kê đơn hàng thành công",
      statusCounts,
      monthlyOrders
    });
  } catch (error) {
    console.error("Error in getOrderAnalytics:", error);
    return res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// ------
module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetail,
  cancelOrder,
  updateShippingStatus,
  getPendingShipments,

  // Controllers mới cho admin
  getAllOrders,
  updateOrderStatus,
  getOrderAnalytics
};
