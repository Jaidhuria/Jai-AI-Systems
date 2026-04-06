import React, { useState, useCallback, useEffect } from "react";
import { http } from "../api/http";
import ReCAPTCHA from "react-google-recaptcha";
import { useNavigate, Link } from "react-router-dom";
import {  FaEye, FaEyeSlash } from "react-icons/fa";
import "./login.css";
import { signInWithEmailAndPassword, signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [remember, setRemember] = useState(false);

  const [captchaToken, setCaptchaToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!captchaToken) {
      setError("Please complete CAPTCHA");
      return;
    }

    try {
      setLoading(true);

      const res = await http.post("/api/auth/login", {
        ...formData,
        captchaToken,
        remember,
      });

      localStorage.setItem("token", res.data.token);
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleResponse = useCallback(
    async (response) => {
      console.log("Google callback:", response);

      if (!response?.credential) {
        setError("Google authentication failed");
        return;
      }

      try {
        setLoading(true);

        const res = await http.post("/api/auth/google", {
          token: response.credential,
        });

        localStorage.setItem("token", res.data.token);
        const credential = GoogleAuthProvider.credential(response.credential);
        await signInWithCredential(auth, credential);
        navigate("/dashboard");
      } catch (err) {
        setError(err.response?.data?.message || "Google login failed");
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );


  useEffect(() => {
    if (!window.google) {
      console.log("Google script not loaded yet");
      return;
    }

    if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      console.error("Google Client ID missing");
      return;
    }

    if (!window.googleInitialized) {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      // Render official Google button
      window.google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        {
          theme: "outline",
          size: "large",
          width: 280,
        }
      );

      window.googleInitialized = true;
      console.log("Google initialized successfully");
    }
  }, [handleGoogleResponse]);

  return (
    <div className="login-container">
      <div className="login-card">

        <h2>GlucoCare.AI</h2>
        <p className="subtitle">Login to your account</p>

        {/* Official Google Button */}
        <div
          id="googleButton"
          style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}
          aria-hidden={!!window.google ? "false" : "true"}
        ></div>

        {/* <button className="social-btn facebook" type="button" aria-label="Continue with Facebook">
          <FaFacebookF /> Continue with Facebook
        </button> */}

        <div className="divider">
          <span>OR</span>
        </div>

        <form onSubmit={handleSubmit} aria-busy={loading} aria-live="polite">
          <div className="input-group">
            <label className="visually-hidden" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="input-group password-field">
            <label className="visually-hidden" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="form-row">
            <label className="remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <p className="forgot-text">
              <Link to="/forgot-password">Forgot Password?</Link>
            </p>
          </div>

          <div className="captcha-wrapper">
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITEKEY}
              onChange={(token) => setCaptchaToken(token)}
            />
          </div>

          <p className="error-text" role="alert" aria-live="assertive">{error}</p>

          <div className="form-actions">
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? (
                <>
                  <span className="btn-spinner" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>
          </div>
        </form>

        <p className="signup-text">
          Don’t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;