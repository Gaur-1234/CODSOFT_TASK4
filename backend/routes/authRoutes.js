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
  resendVerificationEmail,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// AUTH
// ==========================================

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

// ==========================================
// PASSWORD
// ==========================================

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);

// ==========================================
// OTP
// ==========================================

router.post(
  "/send-otp",
  sendOTP
);

router.post(
  "/verify-otp",
  verifyOTP
);

// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put(
  "/change-password",
  protect,
  changePassword
);

// ==========================================
// REFRESH TOKEN
// ==========================================

router.post(
  "/refresh-token",
  refreshAccessToken
);

// ==========================================
// EMAIL VERIFICATION
// ==========================================

router.get(
  "/verify-email/:token",
  verifyEmail
);

router.post(
  "/resend-verification",
  resendVerificationEmail
);

// ==========================================
// PROTECTED PROFILE TEST ROUTE
// ==========================================

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