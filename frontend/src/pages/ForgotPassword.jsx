import { useState } from "react";
import { Link } from "react-router-dom";

import API from "../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE EMAIL CHANGE
  // ==========================================

  const handleChange = (event) => {
    setEmail(event.target.value);

    if (error) {
      setError("");
    }

    if (message) {
      setMessage("");
    }
  };

  // ==========================================
  // SEND RESET LINK
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/forgot-password",
        {
          email: trimmedEmail,
        }
      );

      setMessage(
        response.data?.message ||
          "If an account exists, a password reset link has been sent."
      );

      setEmail("");
    } catch (err) {
      console.error(
        "Forgot password error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
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
            Account Recovery
          </span>

          <h1>
            Forgot Password?
          </h1>

          <p>
            Enter your registered email to
            receive a password reset link.
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
            FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

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
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
              required
            />

          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Reset Link"}
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

export default ForgotPassword;