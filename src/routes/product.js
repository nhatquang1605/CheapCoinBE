const express = require("express");
const upload = require("../middleware/uploader");
const productController = require("../controllers/product.controller");

const router = express.Router();

router.post(
  "/create",
  upload.array("images", 5),
  productController.createProduct
);

module.exports = router;
