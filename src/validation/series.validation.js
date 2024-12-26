const Joi = require("joi");

// Hàm validate dữ liệu series
const validateSeriesData = (data) => {
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
    totalCharacters: Joi.number().valid(6, 12).required().messages({
      "number.base": "TotalCharacters phải là một số nguyên.",
      "any.only": "TotalCharacters chỉ được phép là 6 hoặc 12.",
      "any.required": "TotalCharacters là bắt buộc.",
    }),
    IsAvailable: Joi.boolean().optional().messages({
      "boolean.base": "IsAvailable phải là giá trị boolean.",
    }),
    secretCharacterID: Joi.string().optional().messages({
      "string.base": "SecretCharacterID phải là một chuỗi.",
    }),
  }).unknown(true);

  return schema.validate(data, { abortEarly: false });
};

const validateSeriesUpdate = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).optional(),
    description: Joi.string().max(500).optional(),
    price: Joi.number().positive().optional(),
    totalCharacters: Joi.number().valid(6, 12).integer().min(1).optional(),
    IsAvailable: Joi.boolean().optional(),
    secretCharacterID: Joi.string().optional(),
  }).unknown(true);

  return schema.validate(data, { abortEarly: false });
};

module.exports = { validateSeriesData, validateSeriesUpdate };
