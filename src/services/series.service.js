const Series = require("../models/series.model");

const addSeries = async (data) => {
  try {
    const savedSeries = await Series.create(data);
    return savedSeries;
  } catch (error) {
    throw new Error(`Error creating series: ${error.message}`);
  }
};

const getAllSeries = async ({
  page = 1,
  limit = 10,
  filters = {},
  sort = {},
}) => {
  try {
    // Chuyển đổi các giá trị phân trang và tính skip
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Tạo đối tượng filter từ query (chỉ lọc nếu truyền vào)
    const filterQuery = {};
    if (filters.name) {
      filterQuery.name = { $regex: filters.name, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
    }
    if (filters.isAvailable !== undefined) {
      filterQuery.isAvailable = filters.isAvailable === "true";
    }

    // Pipeline xử lý aggregation với filter, lookup, sort và pagination
    const pipeline = [
      { $match: filterQuery }, // Lọc dữ liệu theo điều kiện
      {
        $lookup: {
          from: "Products",
          localField: "_id",
          foreignField: "seriesID",
          as: "products",
        },
      },
      {
        $addFields: {
          mainProduct: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$products",
                  as: "product",
                  cond: { $eq: ["$$product.isMainInSeries", true] },
                },
              },
              0,
            ],
          },
        },
      },
      { $project: { products: 0 } }, // Loại bỏ danh sách sản phẩm
      { $sort: sort }, // Sắp xếp theo điều kiện truyền vào
      { $skip: skip },
      { $limit: parsedLimit },
    ];

    // Tổng số kết quả cho điều kiện hiện tại
    const total = await Series.countDocuments(filterQuery);
    const data = await Series.aggregate(pipeline);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages: Math.ceil(total / parsedLimit),
      data,
    };
  } catch (error) {
    throw new Error(`Error fetching series: ${error.message}`);
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
