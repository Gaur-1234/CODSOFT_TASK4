import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import API from "../services/api";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const verifyEmail = async () => {
      if (!token) {
        if (isMounted) {
          setStatus("error");
          setMessage("Invalid email verification link.");
        }
        return;
      }

      try {
        const response = await API.get(
          `/auth/verify-email/${token}`
        );

        if (!isMounted) return;

        setStatus("success");
        setMessage(
          response.data?.message ||
            "Your email has been verified successfully."
        );

        // Redirect to login after successful verification
        setTimeout(() => {
          if (isMounted) {
            navigate("/login");
          }
        }, 2000);
      } catch (err) {
        console.error(
          "Email verification error:",
          err
        );

        if (!isMounted) return;

        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "Email verification failed. The link may be invalid or expired."
        );
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  return (
    <main className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <span className="dashboard-eyebrow">
            Account Verification
          </span>

          <h1>
            Verify Your Email
          </h1>

          <p>
            We are verifying your email address.
          </p>
        </div>

        {/* Verifying */}

        {status === "verifying" && (
          <div className="auth-message">
            <p>
              Verifying your email, please wait...
            </p>
          </div>
        )}

        {/* Success */}

        {status === "success" && (
          <div
            className="auth-success"
            role="status"
          >
            <p>
              {message}
            </p>

            <p>
              Redirecting you to the login page...
            </p>
          </div>
        )}

        {/* Error */}

        {status === "error" && (
          <div
            className="auth-error"
            role="alert"
          >
            <p>
              {message}
            </p>
          </div>
        )}

        {/* Actions */}

        {status === "error" && (
          <div className="auth-footer">

            <Link to="/login">
              ← Back to Login
            </Link>

            <span> | </span>

            <Link to="/register">
              Create New Account
            </Link>

          </div>
        )}

      </div>
    </main>
  );
}

export default VerifyEmail;