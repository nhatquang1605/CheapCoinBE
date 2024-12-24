const Joi = require("joi");

const validateSeries = (req, res, next) => {
  // Định nghĩa schema để validate dữ liệu
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
      "string.min": "SeriesName phải có ít nhất 3 ký tự.",
      "string.max": "SeriesName không được vượt quá 100 ký tự.",
      "any.required": "SeriesName là bắt buộc.",
    }),
    description: Joi.string().max(500).optional().messages({
      "string.max": "Description không được vượt quá 500 ký tự.",
    }),
    price: Joi.number().positive().required().messages({
      "number.positive": "BlindBoxPrice phải lớn hơn 0.",
      "any.required": "BlindBoxPrice là bắt buộc.",
    }),
    totalCharacters: Joi.number().integer().min(1).required().messages({
      "number.base": "TotalCharacters phải là một số nguyên.",
      "number.min": "TotalCharacters phải lớn hơn hoặc bằng 1.",
      "any.required": "TotalCharacters là bắt buộc.",
    }),
    IsAvailable: Joi.boolean().optional().messages({
      "boolean.base": "IsAvailable phải là giá trị boolean.",
    }),
    secretCharacterID: Joi.string().optional().messages({
      "string.base": "SecretCharacterID phải là một chuỗi.",
    }),
  }).unknown(true);

  // Validate dữ liệu từ `req.body`
  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    // Trả về lỗi nếu dữ liệu không hợp lệ
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: error.details.map((err) => err.message),
    });
  }

  // Nếu dữ liệu hợp lệ, tiếp tục middleware tiếp theo
  next();
};

module.exports = validateSeries;
