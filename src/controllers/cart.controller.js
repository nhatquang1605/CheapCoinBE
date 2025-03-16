const cartService = require("../services/cart.service");
const seriesService = require("../services/series.service");

const addToCart = async (req, res) => {
  try {
    const { seriesId, quantity, type } = req.body;
    const userId = req.user.id;

    const quantitySeries = await seriesService.getSeriesById(seriesId);
    if (quantitySeries.quantity < quantity) {
      return res.status(400).json({
        message: "Chỉ còn lại " + quantitySeries.quantity + " trong kho",
      });
    }

    const cart = await cartService.addToCart(userId, seriesId, quantity, type);
    res.status(200).json({ message: "Thêm vào giỏ hàng thành công!", cart });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res
      .status(500)
      .json({ message: "Lỗi khi thêm vào giỏ hàng!", error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getCart(userId);

    if (!cart) {
      return res.status(404).json({ message: "Giỏ hàng trống!" });
    }

    res.status(200).json(cart);
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy giỏ hàng!", error: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { seriesId, quantity, type } = req.body;
    const userId = req.user.id;

    const quantitySeries = await seriesService.getSeriesById(seriesId);

    if (quantitySeries.quantity < quantity) {
      return res.status(400).json({
        message:
          "Chỉ còn lại " + quantitySeries.quantity + " sản phẩm này trong kho",
      });
    }

    const cart = await cartService.updateCartItem(
      userId,
      seriesId,
      quantity,
      type
    );
    if (!cart)
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng!" });

    res.status(200).json({ message: "Cập nhật giỏ hàng thành công!", cart });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật giỏ hàng!", error: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { seriesId } = req.params;
    const userId = req.user.id;
    const { type } = req.body; // hải thêm dòng này vào
    const cart = await cartService.removeCartItem(userId, seriesId, type); // hải thêm type vào
    if (!cart)
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng!" });

    res
      .status(200)
      .json({ message: "Xóa sản phẩm khỏi giỏ hàng thành công!", cart });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res
      .status(500)
      .json({ message: "Lỗi khi xóa sản phẩm!", error: error.message });
  }
};

module.exports = { addToCart, getCart, updateCartItem, removeCartItem };
