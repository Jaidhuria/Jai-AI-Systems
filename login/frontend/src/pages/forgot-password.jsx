import React, { useState } from "react";
import { http } from "../api/http";
import { Link, useNavigate } from "react-router-dom";

// reuse common form styles and add page-specific tweaks
import "./login.css";
import "./forgot.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async () => {
    setError("");
    setMessage("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      await http.post("/api/auth/send-otp", { email });
      setMessage("OTP sent to your email");
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError("Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Forgot Password</h2>
        <p className="subtitle">Enter your email and we'll send a reset code</p>

        <div className="input-group">
          <label className="visually-hidden" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email address"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && (
          <p className="error-text" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        {message && <p className="success-text">{message}</p>}

        <button
          type="button"
          className="primary-btn"
          onClick={sendOTP}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>

        <p className="signup-text">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;