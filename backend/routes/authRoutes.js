const express = require("express");

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
  changePassword,
  refreshAccessToken,
  verifyEmail,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

router.post(
  "/send-otp",
  sendOTP
);

router.post(
  "/verify-otp",
  verifyOTP
);

router.put(
  "/change-password",
  protect,
  changePassword
);

router.post(
  "/refresh-token",
  refreshAccessToken
);

router.get(
  "/verify-email/:token",
  verifyEmail
);

router.get(
  "/profile",
  protect,
  (req, res) => {
    res.json({
      message:
        "Protected profile route accessed successfully",
      user: req.user,
    });
  }
);

module.exports = router;