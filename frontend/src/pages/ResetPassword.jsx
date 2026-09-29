import { useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import API from "../services/api";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE PASSWORD CHANGE
  // ==========================================

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);

    if (error) {
      setError("");
    }

    if (message) {
      setMessage("");
    }
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPassword(event.target.value);

    if (error) {
      setError("");
    }

    if (message) {
      setMessage("");
    }
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!token) {
      setError(
        "Invalid or missing password reset link."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        `/auth/reset-password/${token}`,
        {
          password,
        }
      );

      setMessage(
        response.data?.message ||
          "Password reset successfully."
      );

      setPassword("");
      setConfirmPassword("");

      // Redirect to login after success
      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2000);
    } catch (err) {
      console.error(
        "Reset password error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to reset password. The link may be expired or invalid."
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
            Reset Password
          </h1>

          <p>
            Create a new password for your
            JobBoard account.
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

            <br />

            Redirecting you to login...
          </div>
        )}

        {/* ====================================
            RESET FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

          {/* New Password */}

          <div className="form-group">

            <label htmlFor="password">
              New Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              minLength={6}
              placeholder="Enter new password"
              value={password}
              onChange={
                handlePasswordChange
              }
              autoComplete="new-password"
              disabled={loading}
              required
            />

            <small>
              Password must contain at least
              6 characters.
            </small>

          </div>

          {/* Confirm Password */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              minLength={6}
              placeholder="Enter password again"
              value={confirmPassword}
              onChange={
                handleConfirmPasswordChange
              }
              autoComplete="new-password"
              disabled={loading}
              required
            />

          </div>

          {/* Submit */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
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

export default ResetPassword;