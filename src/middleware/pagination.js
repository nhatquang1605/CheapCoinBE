const paginationMiddleware = (req, res, next) => {
  const { page, limit } = req.query;

  // Chuyển đổi sang số nguyên và đảm bảo giá trị hợp lệ
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedPage) || parsedPage <= 0) {
    return res.status(400).json({
      success: false,
      message: "Tham số 'page' phải là số nguyên lớn hơn 0.",
    });
  }

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    return res.status(400).json({
      success: false,
      message: "Tham số 'limit' phải là số nguyên lớn hơn 0.",
    });
  }

  // Gắn các giá trị đã xử lý vào req.pagination để các tầng sau sử dụng
  req.pagination = {
    page: parsedPage,
    limit: parsedLimit,
    skip: (parsedPage - 1) * parsedLimit,
  };

  next();
};

module.exports = paginationMiddleware;
