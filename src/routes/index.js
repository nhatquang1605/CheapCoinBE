const { notFound } = require("../middleware/handle_error");
// const auth = require("./auth");
// const mechandise = require("./mechandise");
// const order = require("./order");
// const product = require("./product");
const seri = require("./series");
// const story = require("./story");
// const user = require("./user");

const initRoute = (app) => {
  // app.use("/api/v1/auth", auth);
  // app.use("/api/v1/mechandise", mechandise);
  // app.use("/api/v1/order", order);
  // app.use("/api/v1/product", product);
  app.use("/api/v1/seri", seri);
  // app.use("/api/v1/story", story);
  // app.use("/api/v1/user", user);

  app.use(notFound);
};

module.exports = initRoute;
