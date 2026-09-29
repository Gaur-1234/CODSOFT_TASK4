import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../services/api";

function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  // ==========================================
  // CHANGE PASSWORD
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setError("Please enter your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError(
        "New password must be at least 6 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await API.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        }
      );

      setMessage(
        response.data?.message ||
          "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirect after successful password change
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(
        "Change password error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to change password. Please try again."
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
            Account Security
          </span>

          <h1>
            Change Password
          </h1>

          <p>
            Update your password to keep your
            JobBoard account secure.
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

          {/* Current Password */}

          <div className="form-group">

            <label htmlFor="currentPassword">
              Current Password
            </label>

            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(event) =>
                setCurrentPassword(
                  event.target.value
                )
              }
              placeholder="Enter current password"
              autoComplete="current-password"
              disabled={loading}
              required
            />

          </div>

          {/* New Password */}

          <div className="form-group">

            <label htmlFor="newPassword">
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(
                  event.target.value
                )
              }
              placeholder="Enter new password"
              autoComplete="new-password"
              disabled={loading}
              required
            />

          </div>

          {/* Confirm Password */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm New Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(
                  event.target.value
                )
              }
              placeholder="Confirm new password"
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
              ? "Changing Password..."
              : "Change Password"}
          </button>

        </form>

        {/* ====================================
            FOOTER
        ===================================== */}

        <div className="auth-footer">

          <Link to="/candidate-dashboard">
            ← Back to Dashboard
          </Link>

        </div>

      </div>

    </main>
  );
}

export default ChangePassword;