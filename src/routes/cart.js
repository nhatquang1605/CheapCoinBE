const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const { verifyToken } = require("../middleware/auth");

router.post("/add", verifyToken, cartController.addToCart);
router.get("/", verifyToken, cartController.getCart);
router.put("/update", verifyToken, cartController.updateCartItem);
router.delete("/remove/:seriesId", verifyToken, cartController.removeCartItem);

module.exports = router;
