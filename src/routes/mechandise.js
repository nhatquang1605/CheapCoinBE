const express = require("express");
const router = express.Router();
const MerchandiseController = require("../controllers/mechandise.controller");

router.post("/", MerchandiseController.createMerchandise);
router.get("/", MerchandiseController.getAllMerchandise);
router.get("/:id", MerchandiseController.getMerchandiseById);
router.put("/:id", MerchandiseController.updateMerchandise);
router.delete("/:id", MerchandiseController.deleteMerchandise);

module.exports = router;
