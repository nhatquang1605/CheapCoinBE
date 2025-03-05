const Order = require("../models/order.model");
const User = require("../models/user.model");
const Series = require("../models/series.model");
const OrderItem = require("../models/orderItem.model");

// Tổng quan trong tháng
const getOverview = async (startDate, endDate) => {
  // Tổng doanh thu, số lượng đơn hàng, số lượng box bán ra, khách hàng mới
  const totalRevenue = await Order.aggregate([
    {
      $match: { createdAt: { $gte: startDate, $lt: endDate }, status: "done" },
    },
    {
      $group: { _id: null, revenue: { $sum: "$totalPrice" } },
    },
  ]);

  const totalOrders = await Order.countDocuments({
    createdAt: { $gte: startDate, $lt: endDate },
  });

  const totalBoxesSold = await Order.aggregate([
    {
      $match: { createdAt: { $gte: startDate, $lt: endDate }, status: "done" },
    },
    { $unwind: "$orderItems" },
    {
      $group: { _id: null, boxesSold: { $sum: 1 } },
    },
  ]);

  const newCustomers = await User.countDocuments({
    createdAt: { $gte: startDate, $lt: endDate },
  });

  return {
    totalRevenue: totalRevenue[0]?.revenue || 0,
    totalBoxesSold: totalBoxesSold[0]?.boxesSold || 0,
    totalOrders,
    newCustomers,
  };
};

// Doanh thu theo năm
const getYearlyRevenue = async (startDate, endDate) => {
  const revenueByMonth = await Order.aggregate([
    {
      $match: { createdAt: { $gte: startDate, $lt: endDate }, status: "done" },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        revenue: { $sum: "$totalPrice" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Chuyển dữ liệu về dạng dễ đọc
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let monthlyRevenue = {};
  months.forEach((m, index) => {
    monthlyRevenue[m] =
      revenueByMonth.find((r) => r._id === index + 1)?.revenue || 0;
  });

  return {
    year,
    monthlyRevenue,
  };
};

// Top series bán chạy
const getTopSellingSeries = async () => {
  try {
    // 🔹 Bước 1: Lọc chỉ các OrderItems thuộc Order có `paymentStatus: "paid"`
    const paidOrderItems = await OrderItem.aggregate([
      {
        $lookup: {
          from: "orders", // Liên kết với bảng Orders
          localField: "_id",
          foreignField: "orderItems",
          as: "orderInfo",
        },
      },
      {
        $match: { "orderInfo.status": "done" }, // Chỉ lấy đơn đã thanh toán
      },
    ]);

    if (!paidOrderItems.length) {
      return []; // Nếu không có đơn hàng nào, trả về mảng rỗng
    }

    // 🔹 Bước 2: Tính tổng số lượng đã bán của tất cả series
    const totalSoldAll = await OrderItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "orderItems",
          as: "orderInfo",
        },
      },
      {
        $match: { "orderInfo.status": "done" }, // Chỉ tính đơn đã thanh toán
      },
      {
        $group: {
          _id: null, // Gom tất cả vào một nhóm duy nhất
          totalSoldAll: { $sum: "$quantity" }, // Tính tổng số lượng đã bán của tất cả series
        },
      },
    ]);

    const totalSoldValue = totalSoldAll.length
      ? totalSoldAll[0].totalSoldAll
      : 1; // Tránh chia 0

    // 🔹 Bước 3: Nhóm theo `productId` để tính tổng số lượng bán của từng series
    const topSellingSeries = await OrderItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "orderItems",
          as: "orderInfo",
        },
      },
      {
        $match: { "orderInfo.status": "done" }, // Chỉ lấy đơn đã thanh toán
      },
      {
        $group: {
          _id: "$productId", // Nhóm theo ID của series
          totalSold: { $sum: "$quantity" }, // Tính tổng số lượng đã bán
        },
      },
      {
        $sort: { totalSold: -1 }, // Sắp xếp theo tổng số lượng bán giảm dần
      },
      {
        $limit: 5, // Chỉ lấy top 5 series
      },
      {
        $lookup: {
          from: "Series", // Lấy thông tin series từ collection Series
          localField: "_id",
          foreignField: "_id",
          as: "seriesInfo",
        },
      },
      {
        $unwind: "$seriesInfo", // Giải nén mảng seriesInfo
      },
      {
        $project: {
          _id: 1, // ID của series
          seriesName: "$seriesInfo.name", // Tên series
          totalSold: 1, // Số lượng đã bán
          popularity: { $divide: ["$totalSold", totalSoldValue] }, // Tính độ phổ biến
        },
      },
    ]);

    return topSellingSeries;
  } catch (error) {
    throw error;
  }
};

module.exports = { getOverview, getYearlyRevenue, getTopSellingSeries };
