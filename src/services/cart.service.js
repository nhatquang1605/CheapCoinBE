const Cart = require("../models/cart.model");

const addToCart = async (userId, seriesId, quantity, type) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [{ seriesId, quantity, type }] });
  } else {
    const existingItem = cart.items.find(
      (item) => item.seriesId.toString() === seriesId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ seriesId, quantity });
    }
  }

  return await cart.save();
};

const getCart = async (userId) => {
  return await Cart.findOne({ userId }).populate("items.seriesId");
};

const updateCartItem = async (userId, seriesId, quantity, type) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return null;

  const item = cart.items.find((item) => item.seriesId.toString() === seriesId);
  if (!item) return null;

  item.quantity = quantity;
  item.type = type;
  return await cart.save();
};

const removeCartItem = async (userId, seriesId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) return null;

  cart.items = cart.items.filter(
    (item) => item.seriesId.toString() !== seriesId
  );
  return await cart.save();
};

module.exports = { addToCart, getCart, updateCartItem, removeCartItem };
