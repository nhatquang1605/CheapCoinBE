const express = require("express");
const router = express.Router();
const seriesController = require("../controllers/series.controller");
const uploader = require("../middleware/uploader");
const seriesValidation = require("../middleware/validation/validateSeries");

router.post(
  "/create",
  uploader.single("representativeImage"),
  seriesValidation,
  seriesController.createSeries
);
router.get("/:id", seriesController);

module.exports = router;
