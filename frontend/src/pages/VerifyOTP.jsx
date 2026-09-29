import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../services/api";

function VerifyOTP() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE EMAIL CHANGE
  // ==========================================

  const handleEmailChange = (event) => {
    setEmail(event.target.value);

    setMessage("");
    setError("");
  };

  // ==========================================
  // HANDLE OTP CHANGE
  // ==========================================

  const handleOtpChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);

    setMessage("");
    setError("");
  };

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOTP = async () => {
    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    try {
      setSending(true);

      const response = await API.post(
        "/auth/send-otp",
        {
          email: trimmedEmail,
        }
      );

      setMessage(
        response.data?.message ||
          "OTP sent successfully. Check your email."
      );
    } catch (err) {
      console.error(
        "Send OTP error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setVerifying(true);

      const response = await API.post(
        "/auth/verify-otp",
        {
          email: trimmedEmail,
          otp,
        }
      );

      setMessage(
        response.data?.message ||
          "OTP verified successfully."
      );

      setOtp("");

      // If backend returns a redirect path,
      // use it; otherwise stay on this page.
      const redirectPath =
        response.data?.redirect ||
        response.data?.redirectTo;

      if (redirectPath) {
        setTimeout(() => {
          navigate(redirectPath);
        }, 1500);
      }
    } catch (err) {
      console.error(
        "Verify OTP error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Invalid or expired OTP."
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <main className="auth-page">

      <div className="auth-card">

        {/* ====================================
            HEADER
        ===================================== */}

        <div className="auth-header">

          <span className="dashboard-eyebrow">
            Verification
          </span>

          <h1>
            Verify OTP
          </h1>

          <p>
            Enter your email and the OTP sent
            to your registered email address.
          </p>

        </div>

        {/* ====================================
            ERROR
        ===================================== */}

        {error && (
          <div
            className="auth-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ====================================
            SUCCESS
        ===================================== */}

        {message && (
          <div
            className="auth-success"
            role="status"
          >
            {message}
          </div>
        )}

        {/* ====================================
            OTP FORM
        ===================================== */}

        <form
          onSubmit={handleVerifyOTP}
          className="auth-form"
        >

          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
              disabled={sending || verifying}
              required
            />

          </div>

          {/* Send OTP */}

          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={handleSendOTP}
            disabled={
              sending ||
              verifying ||
              !email.trim()
            }
          >
            {sending
              ? "Sending OTP..."
              : "Send OTP"}
          </button>

          {/* OTP */}

          <div className="form-group">

            <label htmlFor="otp">
              OTP
            </label>

            <input
              id="otp"
              type="text"
              name="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={handleOtpChange}
              disabled={verifying}
              autoComplete="one-time-code"
              required
            />

          </div>

          {/* Verify */}

          <button
            type="submit"
            className="auth-button"
            disabled={
              verifying ||
              sending ||
              otp.length !== 6
            }
          >
            {verifying
              ? "Verifying..."
              : "Verify OTP"}
          </button>

        </form>

        {/* ====================================
            FOOTER
        ===================================== */}

        <div className="auth-footer">

          <Link to="/login">
            ← Back to Login
          </Link>

        </div>

      </div>

    </main>
  );
}

export default VerifyOTP;