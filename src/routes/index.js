var express = require("express");
var router = express.Router();
const homeController = require("../controllers/home.controller");

router.get("/", homeController.getHomePage);

module.exports = router;
