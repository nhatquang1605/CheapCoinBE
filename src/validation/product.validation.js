const Joi = require("joi");

// Hàm validate dữ liệu sản phẩm
const validateProductData = (data) => {
  const schema = Joi.object({
    productName: Joi.string().min(3).max(100).required().messages({
      "string.min": "ProductName phải có ít nhất 3 ký tự.",
      "string.max": "ProductName không được vượt quá 100 ký tự.",
      "any.required": "ProductName là bắt buộc.",
    }),
    description: Joi.string().max(500).optional().messages({
      "string.max": "Description không được vượt quá 500 ký tự.",
    }),
    stockQuantity: Joi.number().integer().positive().required().messages({
      "number.base": "StockQuantity phải là số nguyên.",
      "number.positive": "StockQuantity phải lớn hơn 0.",
      "any.required": "StockQuantity là bắt buộc.",
    }),
    seriesID: Joi.string().required().messages({
      "string.base": "SeriesID phải là chuỗi.",
      "any.required": "SeriesID là bắt buộc.",
    }),
    images: Joi.array()
      .items(Joi.string().uri())
      .min(1)
      .max(5)
      .required()
      .messages({
        "array.min": "Bạn phải upload ít nhất 1 ảnh cho Product.",
        "array.max": "Bạn chỉ được upload tối đa 5 ảnh cho Product.",
        "any.required": "Images là trường bắt buộc.",
        "string.uri": "Mỗi ảnh phải là một URL hợp lệ.",
      }),
    isSpecialEdition: Joi.boolean().optional().messages({
      "boolean.base": "isSpecialEdition phải là giá trị boolean.",
    }),
    releaseDate: Joi.date().optional().messages({
      "date.base": "ReleaseDate phải là ngày hợp lệ.",
    }),
  }).unknown(true); // Cho phép các trường chưa được định nghĩa

  return schema.validate(data, { abortEarly: false });
};

module.exports = { validateProductData };
