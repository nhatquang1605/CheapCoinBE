const express = require("express");
const router = express.Router();
const seriesController = require("../controllers/series.controller");
const uploader = require("../middleware/uploader");
const seriesValidation = require("../middleware/validation/validateSeries");
const paginationMiddleware = require("../middleware/pagination");

router.post(
  "/create",
  seriesValidation,
  uploader.single("representativeImage"),
  seriesController.createSeries
);
router.get("/:id", seriesController.getById);
router.get("/", paginationMiddleware, seriesController.getAll);

module.exports = router;
