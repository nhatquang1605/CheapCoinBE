const PayOS = require("@payos/node");
const orderService = require("../services/order.service");
const crypto = require("crypto");
const axios = require("axios");

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

const createPaymentLink = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const descriptionBody = "payment to Cheap Coin";

    // Lấy thông tin đơn hàng
    const order = await orderService.getOrderById(orderId, userId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Nếu đã có orderCode thì tạo lại orderCode mới
    if (order.orderCode != null) {
      await orderService.updateOrderCode(order.id);
    }

    // 📌 Tạo danh sách sản phẩm
    const arrayItem = order.orderItems.map((e) => ({
      name: e.productName,
      quantity: e.quantity,
      price: e.productPrice,
      type: e.type,
    }));

    // 📌 Dữ liệu gửi lên PayOS
    const body = {
      orderCode: order.orderCode,
      amount: order.totalPrice,
      description: descriptionBody,
      items: arrayItem,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      returnUrl: process.env.PAYOS_RETURN_URL,
    };

    // 📌 Gửi request tạo link thanh toán
    const paymentLinkRes = await payOS.createPaymentLink(body);

    return res.status(200).json({ checkoutUrl: paymentLinkRes.checkoutUrl });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

const getPaymentLinkInformation = async (req, res) => {
  try {
    const { orderCode } = req.query; // Lấy orderCode từ query params

    if (!orderCode) {
      return res.status(400).json({ error: "Thiếu orderCode" });
    }

    const paymentLink = await payOS.getPaymentLinkInformation(orderCode);

    res.status(200).json({ data: paymentLink });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(404).json({ success: false, message: error.message });
  }
};

const handlePayOSWebhookSuccess = async (req, res) => {
  try {
    // Lấy orderCode từ query params
    const { orderCode, status } = req.query;

    if (!orderCode || !status) {
      return res.status(400).json({ message: "Thiếu orderCode hoặc status" });
    }

    // Cập nhật trạng thái đơn hàng
    await orderService.handlePayosWebhook(orderCode, status);

    return res.redirect(process.env.PAYOS_RETURN_URL_FE);
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

const handlePayOSWebhookFail = async (req, res) => {
  try {
    return res.redirect(process.env.PAYOS_CANCEL_URL_FE);
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createPaymentLink,
  getPaymentLinkInformation,
  handlePayOSWebhookSuccess,
  handlePayOSWebhookFail,
};
