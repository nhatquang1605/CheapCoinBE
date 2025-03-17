const Order = require("../models/order.model");
const OrderItem = require("../models/orderItem.model");
const Cart = require("../models/cart.model");
const Series = require("../models/series.model");

const createOrder = async (userId, paymentMethod, shippingAddress) => {
  // Lấy giỏ hàng
  const cart = await Cart.findOne({ userId }).populate("items.seriesId");

  if (!cart || cart.items.length === 0) {
    throw new Error("Giỏ hàng trống!");
  }
// Check if seriesId is properly populated for all items
for (let item of cart.items) {
  if (!item.seriesId || typeof item.seriesId !== 'object') {
    console.error("Item has invalid seriesId:", item);
    throw new Error(`Invalid seriesId for item: ${JSON.stringify(item)}`);
  }
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
      productId: item.seriesId._id,
      productPrice: item.seriesId.price,
      quantity: item.quantity,
      productName: item.seriesId.name,
      type: item.type,
    });

    await orderItem.save();
    if (item.type === "set") {
      totalPrice +=
        item.seriesId.price * item.quantity * item.seriesId.totalCharacters;
    } else {
      totalPrice += item.seriesId.price * item.quantity;
    }

    orderItems.push(orderItem._id); // Thêm ID của OrderItem vào
  }

  // Cập nhật lại tổng giá trị đơn hàng và danh sách OrderItems vào Order
  savedOrder.totalPrice = totalPrice;
  savedOrder.orderItems = orderItems;

  // Lưu Order
  await savedOrder.save();

  // Xóa giỏ hàng sau khi tạo đơn hàng
  await Cart.findOneAndDelete({ userId });

  return order;
};

const updateOrderCode = async (orderId, orderCode) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  if (orderCode > 9007199254740991) {
    throw new Error("orderCode vượt quá giới hạn cho phép");
  }
  order.orderCode = orderCode;
  await order.save();
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

const getOrderByOrderCode = async (orderCode) => {
  return await Order.findOne({ orderCode });
};

const cancelOrder = async (orderId, userId) => {
  // Tìm order theo ID và userId, đồng thời kiểm tra trạng thái "pending"
  const order = await Order.findById(orderId);

  // Kiểm tra order có tồn tại không
  if (!order) {
    throw new Error("Order not found");
  }

  // Kiểm tra order có thuộc về user hiện tại không
  if (order.userId.toString() !== userId.toString()) { // hải thêm .toString() sau userid
    throw new Error("Unauthorized access");
  }

  // Kiểm tra trạng thái order có thể hủy không
  if (order.status !== "pending") {
    throw new Error("Order cannot be cancelled");
  }

  // Cập nhật trạng thái order thành "cancelled"
  order.status = "cancelled";
  order.shippingStatus = "cancelled";

  if (order.paymentStatus === "paid") {
    order.paymentStatus = "refunded";
  }
  return await order.save();
};

const updateShippingStatus = async (orderId, status) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  order.shippingStatus = status;
  order.paymentStatus = "paid";
  order.status = "done";

  await order.save();
  return order;
};

const getPendingShipments = async () => {
  return await Order.find({ shippingStatus: "pending" });
};

const handlePayosWebhook = async (orderCode, paymentStatus) => {
  const order = await Order.findOne({ orderCode }).populate("orderItems");
  if (!order) throw new Error("Không tìm thấy đơn hàng");

  if (order.status === "cancelled") {
    throw new Error("Đơn hàng đã bị hủy rồi");
  }

  if (paymentStatus === "PAID") {
    order.paymentStatus = "paid";

    // 🔥 Cập nhật số lượng sản phẩm 🔥
    for (const item of order.orderItems) {
      const product = await Series.findById(item.productId);
      const realQuantity =
        item.type === "set"
          ? item.quantity * product.totalCharacters
          : item.quantity;
      if (product) {
        product.quantity -= realQuantity;
        await product.save();
      }
    }
  } else if (paymentStatus === "failed") {
    order.status = "payment_fail";
  }

  await order.save();
};
//hàm updateOrderCode là hải thêm vào
const updateOrderCode = async (orderId, orderCode) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Không tìm thấy đơn hàng");
  if (orderCode > 9007199254740991) {
    throw new Error("orderCode vượt quá giới hạn cho phép");
  }
  order.orderCode = orderCode;
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  updateShippingStatus,
  getPendingShipments,
  handlePayosWebhook,
  getOrderByOrderCode,
  updateOrderCode,
};
