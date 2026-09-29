import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import API from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "Candidate",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };

  // ==========================================
  // HANDLE REGISTRATION
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const role = formData.role;

    // Basic validation
    if (!name) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (
      role !== "Candidate" &&
      role !== "Employer"
    ) {
      setError("Please select a valid account type.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/register",
        {
          name,
          email,
          password,
          role,
        }
      );

      setSuccess(
        response.data?.message ||
          "Registration successful. Please verify your email."
      );

      // Clear password after successful registration.
      setFormData((previous) => ({
        ...previous,
        password: "",
      }));

      // Redirect to login after a short delay.
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      console.error(
        "Registration error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="auth-page">

      <div className="auth-card">

        {/* ====================================
            HEADER
        ===================================== */}

        <div className="auth-header">

          <span className="dashboard-eyebrow">
            Join JobBoard
          </span>

          <h1>
            Create Account
          </h1>

          <p>
            Create your JobBoard account and
            start your journey.
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

        {success && (
          <div
            className="auth-success"
            role="status"
          >
            {success}

            <br />

            Please check your email for the
            verification link.
          </div>
        )}

        {/* ====================================
            REGISTRATION FORM
        ===================================== */}

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

          {/* Full Name */}

          <div className="form-group">

            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              disabled={loading}
              required
            />

          </div>

          {/* Email */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              disabled={loading}
              required
            />

          </div>

          {/* Password */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
              disabled={loading}
              required
            />

            <small>
              Password must contain at least
              6 characters.
            </small>

          </div>

          {/* Account Type */}

          <div className="form-group">

            <label htmlFor="role">
              Account Type
            </label>

            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              required
            >

              <option value="Candidate">
                Candidate
              </option>

              <option value="Employer">
                Employer
              </option>

            </select>

          </div>

          {/* Submit */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        {/* ====================================
            FOOTER
        ===================================== */}

        <div className="auth-footer">

          <p>
            Already have an account?{" "}

            <Link to="/login">
              Login
            </Link>
          </p>

        </div>

      </div>

    </main>
  );
}

export default Register;