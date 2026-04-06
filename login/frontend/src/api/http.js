import axios from "axios";

/**
 * Relative `/api/*` — in dev, Create React App proxies to Express on 5000 while you use http://localhost:3000
 * (reCAPTCHA / Google OAuth domains). Set REACT_APP_API_BASE_URL if the API is on another host.
 */
const baseURL = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

export const http = axios.create({
  baseURL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});
