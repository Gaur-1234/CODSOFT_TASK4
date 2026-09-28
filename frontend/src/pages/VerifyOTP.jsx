import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

function VerifyOTP() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    setSending(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post(
        "/auth/send-otp",
        { email }
      );

      setMessage(
        response.data.message ||
          "OTP sent successfully. Check your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to send OTP."
      );
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setVerifying(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post(
        "/auth/verify-otp",
        {
          email,
          otp,
        }
      );

      setMessage(
        response.data.message ||
          "OTP verified successfully."
      );

      setOtp("");
    } catch (err) {
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

        <div className="auth-header">
          <span className="dashboard-eyebrow">
            Verification
          </span>

          <h1>Verify OTP</h1>

          <p>
            Enter the OTP sent to your email.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-success">
            {message}
          </div>
        )}

        <form
          onSubmit={handleVerifyOTP}
          className="auth-form"
        >
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <button
            type="button"
            className="dashboard-secondary-button"
            onClick={handleSendOTP}
            disabled={sending || !email}
          >
            {sending
              ? "Sending..."
              : "Send OTP"}
          </button>

          <div className="form-group">
            <label htmlFor="otp">
              OTP
            </label>

            <input
              id="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={verifying}
          >
            {verifying
              ? "Verifying..."
              : "Verify OTP"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login">
            Back to Login
          </Link>
        </div>

      </div>
    </main>
  );
}

export default VerifyOTP;