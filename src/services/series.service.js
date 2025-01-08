const Series = require("../models/series.model");

const addSeries = async (data) => {
  try {
    const series = new Series(data);
    const savedSeries = await Series.create(data);
    return savedSeries;
  } catch (error) {
    throw new Error(`Error creating series: ${error.message}`);
  }
};

const getAllSeries = async (page, limit, skip) => {
  try {
    const pipeline = [
      {
        $lookup: {
          from: "Products", // Tên collection của Product
          localField: "_id", // Series ID
          foreignField: "seriesID", // Liên kết qua seriesID trong Product
          as: "products", // Kết quả được gán vào "products"
        },
      },
      {
        $addFields: {
          mainProduct: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$products", // Duyệt qua danh sách sản phẩm
                  as: "product",
                  cond: { $eq: ["$$product.isMainInSeries", true] }, // Lọc sản phẩm chính
                },
              },
              0, // Lấy phần tử đầu tiên
            ],
          },
        },
      },
      {
        $project: {
          products: 0, // Loại bỏ danh sách "products" khỏi kết quả để giảm dữ liệu trả về
        },
      },
      {
        $sort: { createdAt: -1 }, // Sắp xếp theo thời gian tạo mới nhất
      },
      {
        $skip: skip, // Bỏ qua số lượng tài liệu để phân trang
      },
      {
        $limit: limit, // Giới hạn số lượng kết quả trả về
      },
    ];

    const total = await Series.countDocuments(); // Tổng số lượng series
    const data = await Series.aggregate(pipeline); // Thực hiện truy vấn Aggregation

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data,
    };
  } catch (error) {
    throw new Error(
      "Error fetching series with main products: " + error.message
    );
  }
};

const getSeriesById = async (id) => {
  try {
    const series = await Series.findById(id); // Tìm series theo ID
    if (!series) {
      throw new Error("Series not found");
    }
    return series;
  } catch (error) {
    throw new Error("Error fetching series by ID: " + error.message);
  }
};

const deleteSeriesById = async (id) => {
  try {
    const result = await Series.findByIdAndDelete(id);
    return result; // Trả về null nếu không tìm thấy
  } catch (error) {
    throw new Error(error.message);
  }
};

const updateSeriesById = async (id, updatedData) => {
  try {
    const result = await Series.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true } // Trả về document sau khi cập nhật
    );
    return result; // Trả về null nếu không tìm thấy
  } catch (error) {
    throw new Error(error.message);
  }
};

const checkSeriesExistence = async (seriesID) => {
  return await Series.exists({ _id: seriesID });
};
module.exports = {
  addSeries,
  getAllSeries,
  getSeriesById,
  deleteSeriesById,
  updateSeriesById,
  checkSeriesExistence,
};
