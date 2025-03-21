const express = require("express");
const router = express.Router();
const seriesController = require("../controllers/series.controller");
const uploader = require("../middleware/uploader");
const paginationMiddleware = require("../middleware/pagination");

//create
router.post(
  "/create",
  uploader.array("imageUrls"),
  seriesController.createSeries
);

//get by id
router.get("/:id", seriesController.getById);

//get all
router.get("/", paginationMiddleware, seriesController.getAll);

//delete
router.delete("/:id", seriesController.deleteSeries);

//edit
router.put("/:id", uploader.array("imageUrls"), seriesController.updateSeries);

module.exports = router;
