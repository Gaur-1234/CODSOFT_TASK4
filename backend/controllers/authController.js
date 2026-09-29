const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { Resend } = require("resend");

const resend = new Resend(
  process.env.RESEND_API_KEY
);

// ==========================================
// REGISTER USER
// ==========================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "Candidate",
    });

    const verificationToken =
      crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken =
      crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    user.emailVerificationExpires =
      Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://job-board-flax-mu.vercel.app";

    const verificationLink =
      `${frontendUrl}/verify-email/${verificationToken}`;

    const { error } =
      await resend.emails.send({
        from:
          process.env.EMAIL_FROM ||
          "JobBoard <onboarding@resend.dev>",
        to: user.email,
        subject:
          "Verify your JobBoard email",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
            <h2>Verify Your Email</h2>

            <p>Hello ${user.name},</p>

            <p>
              Please verify your email address
              to activate your JobBoard account.
            </p>

            <a
              href="${verificationLink}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Verify Email
            </a>

            <p style="margin-top:20px;">
              This verification link will expire
              in 24 hours.
            </p>
          </div>
        `,
      });

    if (error) {
      console.error(
        "Registration verification email error:",
        error
      );

      return res.status(201).json({
        message:
          "User registered successfully, but the verification email could not be sent. Please use the resend verification option from the login page.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isEmailVerified:
            user.isEmailVerified,
        },
      });
    }

    return res.status(201).json({
      message:
        "User registered successfully. Please verify your email.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified:
          user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// LOGIN USER
// ==========================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Invalid email or password",
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
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto:
          user.profilePhoto || "",
        companyLogo:
          user.companyLogo || "",
        isEmailVerified:
          user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, a password reset link has been sent",
      });
    }

    const resetToken =
      crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken =
      crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordExpires =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://job-board-flax-mu.vercel.app";

    const resetLink =
      `${frontendUrl}/reset-password/${resetToken}`;

    const { error } =
      await resend.emails.send({
        from:
          process.env.EMAIL_FROM ||
          "JobBoard <onboarding@resend.dev>",
        to: user.email,
        subject:
          "JobBoard Password Reset",
        html: `
          <div style="font-family:Arial,sans-serif;">
            <h2>Password Reset Request</h2>

            <p>Hello ${user.name},</p>

            <p>
              We received a request to reset
              your JobBoard password.
            </p>

            <p>
              This link will expire in 15 minutes.
            </p>

            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Reset Password
            </a>
          </div>
        `,
      });

    if (error) {
      console.error(
        "Forgot password email error:",
        error
      );
    }

    return res.status(200).json({
      message:
        "If an account exists with this email, a password reset link has been sent",
    });
  } catch (error) {
    console.error(
      "Forgot password error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token) {
      return res.status(400).json({
        message:
          "Reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message:
          "New password is required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message:
          "Password must be at least 6 characters",
      });
    }

    const hashedToken =
      crypto
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
        message:
          "Invalid or expired reset token",
      });
    }

    user.password =
      await bcrypt.hash(password, 10);

    user.resetPasswordToken = "";
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// SEND OTP
// ==========================================

const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(200).json({
        message:
          "If an account exists with this email, an OTP has been sent",
      });
    }

    const otp = crypto
      .randomInt(100000, 1000000)
      .toString();

    user.otp = otp;

    user.otpExpires =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    const { error } =
      await resend.emails.send({
        from:
          process.env.EMAIL_FROM ||
          "JobBoard <onboarding@resend.dev>",
        to: user.email,
        subject: "Your JobBoard OTP",
        html: `
          <div style="font-family:Arial,sans-serif;">
            <h2>JobBoard OTP Verification</h2>

            <p>Hello ${user.name},</p>

            <p>Your OTP is:</p>

            <h1 style="letter-spacing:8px;">
              ${otp}
            </h1>

            <p>
              This OTP will expire in 10 minutes.
            </p>
          </div>
        `,
      });

    if (error) {
      console.error(
        "OTP email error:",
        error
      );
    }

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error(
      "Send OTP error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// VERIFY OTP
// ==========================================

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message:
          "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or OTP",
      });
    }

    if (!user.otp || !user.otpExpires) {
      return res.status(400).json({
        message:
          "OTP not found or expired",
      });
    }

    if (user.otpExpires < Date.now()) {
      user.otp = "";
      user.otpExpires = null;

      await user.save();

      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    user.otp = "";
    user.otpExpires = null;

    await user.save();

    return res.status(200).json({
      message:
        "OTP verified successfully",
    });
  } catch (error) {
    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        message:
          "New password must be different from current password",
      });
    }

    const user = await User.findById(
      req.user.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message:
          "Current password is incorrect",
      });
    }

    user.password =
      await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// REFRESH ACCESS TOKEN
// ==========================================

const refreshAccessToken = async (
  req,
  res
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message:
          "Refresh token is required",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).json({
        message:
          "Invalid or expired refresh token",
      });
    }

    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken,
    });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid refresh token",
      });
    }

    const newAccessToken = jwt.sign(
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
      message:
        "Access token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error(
      "Refresh token error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// VERIFY EMAIL
// ==========================================

const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message:
          "Verification token is required",
      });
    }

    const hashedToken =
      crypto
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
        message:
          "Invalid or expired verification token",
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = "";
    user.emailVerificationExpires = null;

    await user.save();

    return res.status(200).json({
      message:
        "Email verified successfully",
    });
  } catch (error) {
    console.error(
      "Verify email error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// RESEND VERIFICATION EMAIL
// ==========================================

const resendVerificationEmail = async (
  req,
  res
) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message:
          "No account found with this email.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        message:
          "This email is already verified.",
      });
    }

    const verificationToken =
      crypto.randomBytes(32).toString("hex");

    user.emailVerificationToken =
      crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    user.emailVerificationExpires =
      Date.now() + 24 * 60 * 60 * 1000;

    await user.save();

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://job-board-flax-mu.vercel.app";

    const verificationLink =
      `${frontendUrl}/verify-email/${verificationToken}`;

    const { error } =
      await resend.emails.send({
        from:
          process.env.EMAIL_FROM ||
          "JobBoard <onboarding@resend.dev>",

        to: user.email,

        subject:
          "Verify your JobBoard email",

        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
            <h2>Verify your JobBoard Email</h2>

            <p>Hello ${user.name || "User"},</p>

            <p>
              Please click the button below
              to verify your email address.
            </p>

            <a
              href="${verificationLink}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#2563eb;
                color:white;
                text-decoration:none;
                border-radius:8px;
              "
            >
              Verify Email
            </a>

            <p style="margin-top:20px;">
              This verification link will expire
              in 24 hours.
            </p>

            <p>
              If you did not create this account,
              you can safely ignore this email.
            </p>
          </div>
        `,
      });

    if (error) {
      console.error(
        "Resend verification email error:",
        error
      );

      return res.status(500).json({
        message:
          "Unable to send verification email. Please try again later.",
      });
    }

    return res.status(200).json({
      message:
        "Verification email sent successfully.",
    });
  } catch (error) {
    console.error(
      "Resend verification error:",
      error
    );

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

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