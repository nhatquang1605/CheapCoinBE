const OrderItem = require("../models/orderItem.model");
const Series = require("../models/series.model");
const Order = require("../models/order.model");

const getAllSoldProducts = async () => {
  // Lấy tất cả các orderItem và populate thông tin series
  const orderItems = await OrderItem.find({}).populate({
    path: "productId",
    model: "Series",
    select: "name price quantity isAvailable",
  });

  // Object để theo dõi các sản phẩm đã gộp theo productId
  const groupedProducts = {};

  // Gộp các sản phẩm cùng productId
  for (const item of orderItems) {
    const productId = item.productId?._id
      ? item.productId._id.toString()
      : "unknown";

    if (!groupedProducts[productId]) {
      // Nếu sản phẩm chưa được thêm vào, tạo mới
      const productStatus = getProductStatus(item.productId);

      groupedProducts[productId] = {
        _id: productId,
        productId: item.productId?._id,
        productName: item.productName,
        productPrice: item.productPrice,
        quantity: item.quantity,
        total: item.productPrice * item.quantity,
        type: item.type,
        productStatus: productStatus,
        createdAt: item.createdAt,
        orderItemIds: [item._id], // Lưu danh sách orderItem IDs liên quan
      };
    } else {
      // Nếu sản phẩm đã tồn tại, cập nhật số lượng và tổng giá trị
      groupedProducts[productId].quantity += item.quantity;
      groupedProducts[productId].total += item.productPrice * item.quantity;
      groupedProducts[productId].orderItemIds.push(item._id); // Thêm orderItem ID
    }
  }

  // Chuyển đổi object thành mảng
  const result = Object.values(groupedProducts);

  return result;
};

// Hàm phụ trợ để xác định trạng thái sản phẩm
const getProductStatus = (series) => {
  if (!series) {
    return "Not Available";
  } else if (!series.isAvailable || series.quantity <= 0) {
    return "Sold Out";
  }
  return "In Stock";
};

const getSoldProductAnalytics = async () => {
  const orderItems = await OrderItem.find({});

  // Tính tổng giá trị của tất cả orderItems
  let totalSales = 0;
  let highestSale = 0;
  let highestProduct = null;
  let totalQuantitySold = 0; // Add this variable to track total quantity

  for (const item of orderItems) {
    const itemTotal = item.productPrice * item.quantity;
    totalSales += itemTotal;
    totalQuantitySold += item.quantity; // Add the item quantity to the total

    if (itemTotal > highestSale) {
      highestSale = itemTotal;
      highestProduct = {
        id: item._id,
        name: item.productName,
        total: itemTotal,
      };
    }
  }

  // Đếm số lượng sản phẩm theo trạng thái
  const series = await Series.find({});
  const inStockCount = series.filter(
    (s) => s.isAvailable && s.quantity > 0
  ).length;
  const soldOutCount = series.filter(
    (s) => !s.isAvailable || s.quantity <= 0
  ).length;

  return {
    totalSales,
    highestSale,
    highestProduct,
    inStockCount,
    soldOutCount,
    totalProducts: totalQuantitySold, // Use the total quantity instead of orderItems.length
  };
};
module.exports = {
  getAllSoldProducts,
  getSoldProductAnalytics,
};
