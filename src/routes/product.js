const express = require("express");
const upload = require("../middleware/uploader");
const productController = require("../controllers/product.controller");

const router = express.Router();

router.post("/create", upload.single("image"), productController.createProduct);
router.get("/", productController.getAll);
router.get("/:id", productController.getById);
router.put("/:id", productController.update);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
