const Order = require("../models/order.model");
const User = require("../models/user.model");
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
    {
      $lookup: {
        from: "orderitems", // Tên collection OrderItem (viết thường nếu MongoDB lưu như vậy)
        localField: "orderItems",
        foreignField: "_id",
        as: "orderItemDetails",
      },
    },
    { $unwind: "$orderItemDetails" }, // Tách từng item trong orderItems
    {
      $group: {
        _id: null,
        boxesSold: {
          $sum: {
            $cond: {
              if: { $eq: ["$orderItemDetails.type", "set"] },
              then: { $multiply: ["$orderItemDetails.quantity", 6] }, // Nếu là "set", nhân 6
              else: "$orderItemDetails.quantity", // Nếu không, cộng quantity bình thường
            },
          },
        },
      },
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
    console.log("🔹 Bắt đầu truy vấn top selling series...");

    // 🔹 Bước 1: Lọc OrderItems thuộc Order có `status: "done"`
    const paidOrderItems = await OrderItem.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "orderItems",
          as: "orderInfo",
        },
      },
      {
        $match: { "orderInfo.status": "done" },
      },
      {
        $addFields: {
          adjustedQuantity: {
            $cond: {
              if: { $eq: ["$type", "set"] },
              then: { $multiply: ["$quantity", 6] },
              else: "$quantity",
            },
          },
        },
      },
    ]);

    if (!paidOrderItems.length) {
      return [];
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
        $match: { "orderInfo.status": "done" },
      },
      {
        $addFields: {
          adjustedQuantity: {
            $cond: {
              if: { $eq: ["$type", "set"] },
              then: { $multiply: ["$quantity", 6] },
              else: "$quantity",
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSoldAll: { $sum: "$adjustedQuantity" },
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
        $match: { "orderInfo.status": "done" },
      },
      {
        $addFields: {
          adjustedQuantity: {
            $cond: {
              if: { $eq: ["$type", "set"] },
              then: { $multiply: ["$quantity", 6] },
              else: "$quantity",
            },
          },
        },
      },
      {
        $group: {
          _id: "$productId",
          totalSold: { $sum: "$adjustedQuantity" },
        },
      },
      {
        $sort: { totalSold: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "Series",
          localField: "_id",
          foreignField: "_id",
          as: "seriesInfo",
        },
      },
      {
        $unwind: "$seriesInfo",
      },
      {
        $project: {
          _id: 1,
          seriesName: "$seriesInfo.name",
          totalSold: 1,
          popularity: { $divide: ["$totalSold", totalSoldValue] },
        },
      },
    ]);

    console.log("✅ Kết quả cuối cùng:", topSellingSeries);
    return topSellingSeries;
  } catch (error) {
    console.error("❌ Lỗi khi lấy top selling series:", error);
    throw error;
  }
};

const getUserByAdmin = async () => {
  try {
    return await User.find({ role: "Customer" });
  } catch (error) {
    console.error("Full error stack:", error.stack || error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getOverview,
  getYearlyRevenue,
  getTopSellingSeries,
  getUserByAdmin,
};
