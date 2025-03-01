const PayOS = require("@payos/node");
const orderService = require("../services/order.service");

const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

const createPaymentLink = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user.id;

    const order = await orderService.getOrderById(orderId, userId);
    let arrayItem;

    if (order.orderItems.length > 1) {
      order.orderItems.forEach((e) => {
        const item = {
          name: e.productName,
          quantity: e.quantity,
          price: e.productPrice,
        };
        arrayItem.push(item);
      });
    }

    const body = {
      orderCode: order.orderCode,
      amount: order.totalPrice,
      description: "payment to Cheap Coin",
      items: arrayItem,
      cancelUrl: "http://localhost:5000/cancel.html",
      returnUrl: "http://localhost:5000/success.html",
    };

    const paymentLinkRes = await payOS.createPaymentLink(body);

    return res.redirect(303, paymentLinkRes.checkoutUrl);
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = { createPaymentLink };
