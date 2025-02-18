const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const Cart = require("../models/cart.model");

const createOrder = async (userId, paymentMethod, shippingAddress) => {
  // Lấy giỏ hàng
  const cart = await Cart.findOne({ userId }).populate("items.seriesId");

  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng trống!");
  }

  // Tạo đơn hàng trước để lấy orderId
  const order = new Order({
    userId,
    totalPrice: 0, // Chưa tính tổng giá trị lúc này
    paymentMethod,
    shippingAddress,
    orderItems: [], // Mảng orderItems sẽ được điền sau
  });

  // Lưu đơn hàng trước
  const savedOrder = await order.save();

  // Tạo các OrderItem từ giỏ hàng
  const orderItems = [];
  let totalPrice = 0;

  for (let item of cart.items) {
    const orderItem = new OrderItem({
      orderId: savedOrder._id, // Gắn orderId vào ngay khi tạo OrderItem
      productId: item.seriesId._id,
      productName: item.seriesId.name,
      productPrice: item.seriesId.price,
      quantity: item.quantity,
    });

    await orderItem.save();
    totalPrice += item.seriesId.price * item.quantity;

    orderItems.push(orderItem._id); // Thêm ID của OrderItem vào
  }

  // Cập nhật lại tổng giá trị đơn hàng và danh sách OrderItems vào Order
  savedOrder.totalPrice = totalPrice;
  savedOrder.orderItems = orderItems;

  // Lưu Order
  await savedOrder.save();

  // Cập nhật lại orderId trong OrderItem
  await OrderItem.updateMany(
    { _id: { $in: orderItems } },
    { $set: { orderId: order._id } }
  );

  // Xóa giỏ hàng sau khi tạo đơn hàng
  await Cart.findOneAndDelete({ userId });

  return order;
};

const getUserOrders = async (userId) => {
  return await Order.find({ userId })
    .populate("orderItems")
    .sort({ createdAt: -1 });
};

const getOrderById = async (orderId, userId) => {
  // Tìm order theo ID
  const order = await Order.findById(orderId).populate("orderItems");

  // Nếu không tìm thấy order, trả về lỗi
  if (!order) {
    throw new Error("Bạn đã order chưa mà sao không có nhỉ?");
  }

  // Kiểm tra xem userId có trùng với userId của order không
  if (order.userId.toString() !== userId) {
    throw new Error("Cái này không phải của bạn đâu!");
  }

  return order;
};

const cancelOrder = async (orderId, userId) => {
  // Tìm order theo ID và userId, đồng thời kiểm tra trạng thái "pending"
  const order = await Order.findById(orderId);

  // Kiểm tra order có tồn tại không
  if (!order) {
    throw new Error("Order not found");
  }

  // Kiểm tra order có thuộc về user hiện tại không
  if (order.userId.toString() !== userId) {
    throw new Error("Unauthorized access");
  }

  // Kiểm tra trạng thái order có thể hủy không
  if (order.status !== "pending") {
    throw new Error("Order cannot be cancelled");
  }

  // Cập nhật trạng thái order thành "cancelled"
  order.status = "cancelled";
  return await order.save();
};

const payOrder = async (orderId, userId) => {
  const order = await Order.findOne({
    _id: orderId,
    userId,
    status: "pending",
    paymentMethod: "cash",
  });
  if (!order) throw new Error("Order not found or already paid");
  order.status = "paid";
  return await order.save();
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  payOrder,
};
