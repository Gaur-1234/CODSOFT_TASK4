import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import API from "../services/api";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] =
    useState("verifying");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let isMounted = true;

    const verifyEmail = async () => {
      try {
        const response = await API.get(
          `/auth/verify-email/${token}`
        );

        if (!isMounted) {
          return;
        }

        setStatus("success");

        setMessage(
          response.data.message ||
            "Email verified successfully."
        );
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setStatus("error");

        setMessage(
          err.response?.data?.message ||
            "Unable to verify email. The link may be expired."
        );
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <main className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <span className="dashboard-eyebrow">
            Email Verification
          </span>

          <h1>
            {status === "verifying"
              ? "Verifying Email"
              : status === "success"
              ? "Email Verified"
              : "Verification Failed"}
          </h1>

          <p>
            {status === "verifying"
              ? "Please wait while we verify your email."
              : message}
          </p>

        </div>

        {status === "verifying" && (
          <div className="dashboard-state">

            <div className="loading-spinner"></div>

            <p>
              Verifying...
            </p>

          </div>
        )}

        {status === "success" && (
          <div className="auth-success">
            Your email has been verified
            successfully.
          </div>
        )}

        {status === "error" && (
          <div className="auth-error">
            {message}
          </div>
        )}

        {status !== "verifying" && (
          <button
            type="button"
            className="auth-button"
            onClick={() =>
              navigate("/login")
            }
          >
            Go to Login
          </button>
        )}

      </div>

    </main>
  );
}

export default VerifyEmail;