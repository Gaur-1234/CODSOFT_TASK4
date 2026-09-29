const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const User = require("../models/User");

const resend = new Resend(process.env.RESEND_API_KEY);

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://job-board-flax-mu.vercel.app";

const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email/${token}`;

  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [user.email],
    subject: "Verify your JobBoard email",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>Verify your JobBoard email</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 0;
            background: #0b1120;
            font-family: Arial, sans-serif;
            color: #ffffff;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 40px auto;
              padding: 32px;
              background: #111827;
              border-radius: 14px;
              border: 1px solid #263449;
            "
          >
            <h1 style="margin-top: 0; color: #ffffff;">
              Welcome to JobBoard 👋
            </h1>

            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Hi ${user.name || "there"},
            </p>

            <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
              Thanks for creating your JobBoard account.
              Please verify your email address to activate your account.
            </p>

            <div style="margin: 30px 0;">
              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  padding: 14px 24px;
                  background: #2563eb;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                "
              >
                Verify Email Address
              </a>
            </div>

            <p style="font-size: 14px; line-height: 1.6; color: #94a3b8;">
              This verification link will expire in 24 hours.
            </p>

            <p style="font-size: 13px; line-height: 1.6; color: #64748b;">
              If you did not create this account, you can safely ignore this
              email.
            </p>
          </div>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("[Resend API Error]:", {
      status: error.statusCode,
      error,
    });

    throw new Error(error.message || "Unable to send verification email.");
  }

  console.log("Verification email sent successfully:", data?.id);

  return data;
};

// ===============================
// REGISTER
// ===============================
const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      location,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });

    // Existing unverified user
    if (user && !user.isEmailVerified) {
      const verificationToken = crypto.randomBytes(32).toString("hex");

      const hashedVerificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

      user.emailVerificationToken = hashedVerificationToken;
      user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

      await user.save();

      try {
        await sendVerificationEmail(user, verificationToken);

        return res.status(200).json({
          message:
            "Account already exists but is not verified. A new verification email has been sent.",
        });
      } catch (emailError) {
        console.error("Verification email error:", emailError);

        return res.status(502).json({
          message:
            "Account exists but verification email could not be sent.",
        });
      }
    }

    if (user) {
      return res.status(400).json({
        message: "User already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "Candidate",
      phone: phone || "",
      location: location || "",
      isEmailVerified: false,
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      console.error("Verification email error:", emailError);

      return res.status(502).json({
        message:
          "Account was created, but verification email could not be sent. Please use Resend Verification Email from the login page.",
      });
    }

    return res.status(201).json({
      message:
        "Registration successful. Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Server error during registration.",
    });
  }
};

// ===============================
// LOGIN
// ===============================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    user.refreshToken = refreshToken;
    await user.save();

    return res.status(200).json({
      message: "Login successful.",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        companyName: user.companyName,
        companyLogo: user.companyLogo,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error during login.",
    });
  }
};

// ===============================
// FORGOT PASSWORD
// ===============================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedResetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [user.email],
      subject: "Reset your JobBoard password",
      html: `
        <div
          style="
            max-width: 600px;
            margin: 40px auto;
            padding: 30px;
            font-family: Arial, sans-serif;
            background: #111827;
            color: #ffffff;
            border-radius: 12px;
          "
        >
          <h2>Reset your JobBoard password</h2>

          <p style="color: #cbd5e1;">
            We received a request to reset your password.
          </p>

          <a
            href="${resetUrl}"
            style="
              display: inline-block;
              padding: 13px 22px;
              background: #2563eb;
              color: #ffffff;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            "
          >
            Reset Password
          </a>

          <p style="color: #94a3b8; margin-top: 20px;">
            This link expires in 15 minutes.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Forgot password email error:", error);

      return res.status(502).json({
        message: "Unable to send password reset email.",
      });
    }

    console.log("Password reset email sent:", data?.id);

    return res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Server error while processing password reset.",
    });
  }
};

// ===============================
// RESET PASSWORD
// ===============================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired password reset token.",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Server error while resetting password.",
    });
  }
};

// ===============================
// SEND OTP
// ===============================
const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [user.email],
      subject: "Your JobBoard OTP",
      html: `
        <div
          style="
            max-width: 500px;
            margin: 40px auto;
            padding: 30px;
            font-family: Arial, sans-serif;
            background: #111827;
            color: #ffffff;
            border-radius: 12px;
            text-align: center;
          "
        >
          <h2>Your JobBoard OTP</h2>

          <p style="color: #cbd5e1;">
            Use the following OTP to continue:
          </p>

          <h1
            style="
              letter-spacing: 8px;
              color: #60a5fa;
            "
          >
            ${otp}
          </h1>

          <p style="color: #94a3b8;">
            This OTP expires in 10 minutes.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("OTP email error:", error);

      return res.status(502).json({
        message: "Unable to send OTP email.",
      });
    }

    console.log("OTP email sent:", data?.id);

    return res.status(200).json({
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error("Send OTP error:", error);

    return res.status(500).json({
      message: "Server error while sending OTP.",
    });
  }
};

// ===============================
// VERIFY OTP
// ===============================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
      otp,
      otpExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired OTP.",
      });
    }

    user.otp = undefined;
    user.otpExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      message: "Server error while verifying OTP.",
    });
  }
};

// ===============================
// CHANGE PASSWORD
// ===============================
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required.",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Current password is incorrect.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Server error while changing password.",
    });
  }
};

// ===============================
// REFRESH ACCESS TOKEN
// ===============================
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token is required.",
      });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        message: "Invalid refresh token.",
      });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return res.status(200).json({
      message: "Access token refreshed successfully.",
      accessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    return res.status(401).json({
      message: "Invalid or expired refresh token.",
    });
  }
};

// ===============================
// VERIFY EMAIL
// ===============================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token.",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      message: "Server error while verifying email.",
    });
  }
};

// ===============================
// RESEND VERIFICATION EMAIL
// ===============================
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message: "Email is already verified. You can login.",
      });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    user.emailVerificationToken = hashedVerificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      console.error("Resend verification email error:", emailError);

      return res.status(502).json({
        message: "Unable to send verification email. Please try again later.",
      });
    }

    return res.status(200).json({
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      message: "Server error while resending verification email.",
    });
  }
};

// ===============================
// EXPORTS
// ===============================
module.exports = {
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
};