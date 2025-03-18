const express = require("express");
const adminController = require("../controllers/admin.controller");
const { verifyToken, adminMiddleware } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/dashboard/overview",
  verifyToken,
  adminMiddleware,
  adminController.getOverview
);
router.get(
  "/dashboard/revenue",
  verifyToken,
  adminMiddleware,
  adminController.getYearlyRevenue
);
router.get(
  "/dashboard/top-series",
  verifyToken,
  adminMiddleware,
  adminController.getTopSellingSeries
);

router.get(
  "/dashboard/user",
  verifyToken,
  adminMiddleware,
  adminController.getUserByAdmin
);
module.exports = router;
