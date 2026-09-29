import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Resend verification email states
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();

    setError("");
    setResendMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", {
        email: email.trim(),
        password,
      });

      const {
        accessToken,
        refreshToken,
        user,
      } = response.data;

      // Store authentication details
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect based on role
      if (user?.role === "Employer") {
        navigate("/employer-dashboard");
      } else {
        navigate("/candidate-dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to login. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError("Please enter your email address first.");
      return;
    }

    try {
      setResendLoading(true);
      setResendMessage("");
      setError("");

      const response = await API.post(
        "/auth/resend-verification",
        {
          email: email.trim(),
        }
      );

      setResendMessage(
        response.data?.message ||
          "Verification email sent successfully."
      );
    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Unable to resend verification email."
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <main className="page-container">
      <section className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">
              Welcome Back
            </span>

            <h1>Login to JobBoard</h1>

            <p>
              Sign in to continue managing your jobs
              and applications.
            </p>
          </div>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleLogin}
          >
            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <div className="password-label-row">
                <label htmlFor="password">
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="forgot-password-link"
                >
                  Forgot Password?
                </Link>
              </div>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button auth-submit-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Resend Verification Email */}
          <div className="verification-resend">
            <p>
              Didn't receive the verification email?
            </p>

            <button
              type="button"
              className="resend-verification-button"
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading
                ? "Sending..."
                : "Resend Verification Email"}
            </button>

            {resendMessage && (
              <p className="verification-success">
                {resendMessage}
              </p>
            )}
          </div>

          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;