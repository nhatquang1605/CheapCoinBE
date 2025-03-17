const { notFound } = require("../middleware/handle_error");
const auth = require("./auth");
const admin = require("./admin");
// const mechandise = require("./mechandise");
const order = require("./order");
// const product = require("./product");
const seri = require("./series");
const cart = require("./cart");
const payment = require("./payment");
const productSold = require("./productSold"); //hải Thêm dòng này
// const story = require("./story");
// const user = require("./user");

const initRoute = (app) => {
  app.use("/api/v1/auth", auth);
  app.use("/api/v1/admin", admin);
  // app.use("/api/v1/mechandise", mechandise);
  app.use("/api/v1/order", order);
  // app.use("/api/v1/product", product);
  app.use("/api/v1/seri", seri);
  app.use("/api/v1/cart", cart);
  app.use("/api/v1/payment", payment);
  app.use("/api/v1/product-sold", productSold); // hải Thêm dòng này
  // app.use("/api/v1/story", story);
  // app.use("/api/v1/user", user);
  app.use(notFound);
};

module.exports = initRoute;
