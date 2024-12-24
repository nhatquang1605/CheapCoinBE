const createErrors = require("http-errors");

const notFound = (req, res) => {
  const err = createErrors.NotFound("This route is not defined!");
  return res.status(err.status).json({
    err: 1,
    mess: err.message,
  });
};

module.exports = { notFound };
