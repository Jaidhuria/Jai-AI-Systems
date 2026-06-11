import React, { useState, useEffect, useRef } from "react";
import { http } from "../api/http";
import { useLocation, useNavigate, Link } from "react-router-dom";
import "./verify.css";

function VerifyOTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const inputRefs = useRef([]);

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      setError("Email missing. Please start from forgot password.");
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000);
    }
  }, [email, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace to go to previous input
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const pastedNumbers = pastedData.replace(/\D/g, "").slice(0, 6);
    
    if (pastedNumbers) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedNumbers.length; i++) {
        newOtp[i] = pastedNumbers[i];
      }
      setOtp(newOtp);
      
      // Focus on the next empty input or last filled
      const nextIndex = Math.min(pastedNumbers.length, 5);
      if (nextIndex <= 5) {
        inputRefs.current[nextIndex]?.focus();
      }
    }
  };

  const verifyOTP = async () => {
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!email) {
      setError("Email missing. Please start from forgot password.");
      setTimeout(() => {
        navigate("/forgot-password");
      }, 2000);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await http.post("/api/auth/verify-otp", {
        email,
        otp: otpString,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/reset-password", { state: { email } });
      }, 1500);

    } catch (error) {
      setError(error.response?.data?.message || "Invalid OTP. Please try again.");
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    setLoading(true);
    setError("");
    
    try {
      await http.post("/api/auth/forgot-password", { email });
      setTimeLeft(300);
      setCanResend(false);
      // Show success message
      alert("A new OTP has been sent to your email.");
    } catch (error) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-card">
        {/* Header */}
        <div className="verify-header">
          <div className="verify-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C8.13 2 5 5.13 5 9v4c0 3.87 3.13 7 7 7s7-3.13 7-7V9c0-3.87-3.13-7-7-7z" stroke="#1976d2" strokeWidth="2" fill="none"/>
              <path d="M12 22v-3" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
              <path d="M8 11h8" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 8v6" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="verify-title">Verify OTP</h1>
          <p className="verify-subtitle">
            We've sent a 6-digit verification code to<br />
            <strong>{email || "your email address"}</strong>
          </p>
        </div>

        {/* OTP Input Fields */}
        <div className="otp-input-group">
          <label className="input-label">Enter Verification Code</label>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                className={`otp-input ${error ? "error" : ""} ${success ? "success" : ""}`}
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                autoFocus={index === 0}
                disabled={loading || success}
              />
            ))}
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">✓ OTP Verified! Redirecting...</div>}
        </div>

        {/* Timer and Resend */}
        <div className="timer-section">
          {!canResend ? (
            <div className="timer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Code expires in {formatTime(timeLeft)}</span>
            </div>
          ) : (
            <button 
              className="resend-btn" 
              onClick={resendOTP}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Resend OTP
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="verify-btn" 
            onClick={verifyOTP}
            disabled={loading || success || otp.join("").length !== 6}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              "Verify & Continue"
            )}
          </button>
          
          <Link to="/forgot-password" className="back-link">
            ← Back to Forgot Password
          </Link>
        </div>

        {/* Help Text */}
        <div className="help-text">
          <p>Didn't receive the code?</p>
          <ul>
            <li>Check your spam folder</li>
            <li>Make sure you entered the correct email</li>
            <li>Wait a few minutes and try again</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default VerifyOTP;