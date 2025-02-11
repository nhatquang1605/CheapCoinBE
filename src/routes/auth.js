const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/registerByMail", authController.registerByMail);
router.post("/verifyOtp", authController.verifyOTP);
router.post("/login", authController.login);
router.post("/refreshToken", authController.refreshToken);
router.post("/logout", authController.logout);

router.post("/requestResetPassword", authController.requestResetPassword);
router.get("/resetPassword", authController.verifyResetToken);
router.post("/resetPassword", authController.resetPassword);

module.exports = router;
