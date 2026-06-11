import axios from "axios";
import { http } from "./http";

function toNumericPayload(formData) {
  return {
    pregnancies: Number(formData.pregnancies),
    glucose: Number(formData.glucose),
    bloodPressure: Number(formData.bloodPressure),
    skinThickness: Number(formData.skinThickness),
    insulin: Number(formData.insulin),
    bmi: Number(formData.bmi),
    pedigree: Number(formData.pedigree),
    age: Number(formData.age),
  };
}

/**
 * Prefer shared `http` (proxy in dev). Use REACT_APP_ML_PREDICT_URL only for a
 * full URL override (e.g. direct Flask during debugging).
 */
export async function predictDiabetesRisk(formData) {
  const body = toNumericPayload(formData);
  const custom = process.env.REACT_APP_ML_PREDICT_URL;
  if (custom) {
    const { data } = await axios.post(custom, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 30000,
    });
    return data;
  }
  const { data } = await http.post("/api/ml/predict", body);
  return data;
}

export function mlPredictErrorMessage(err) {
  const net =
    err.code === "ERR_NETWORK" ||
    err.message === "Network Error" ||
    err.code === "ECONNREFUSED";
  if (net) {
    return (
      "Cannot reach the API. From the login folder run: npm run dev, then open http://localhost:3000 " +
      "(React proxies /api to the backend on 5000; ML runs via app logic in python_worker.py, no extra browser port)."
    );
  }

  const status = err.response?.status;
  const data = err.response?.data;

  if (status === 500 && typeof data === "string" && data.includes("proxy")) {
    return (
      "Dev proxy could not reach the API. Run npm run dev from the login folder (backend on 5000), keep using http://localhost:3000."
    );
  }

  if (status === 500) {
    const fromApi =
      (typeof data === "object" && data && (data.message || data.error)) ||
      (typeof data === "string" && data.length < 300 ? data : null);
    return (
      fromApi ||
      "Server error (500). From the login folder run npm run dev and check the backend terminal (Python worker + Express)."
    );
  }

  if (status === 503) {
    return (
      (typeof data === "object" && data?.message) ||
      "ML service unavailable. Ensure Python deps are installed (npm run setup-ml from login/backend) and restart npm run dev."
    );
  }

  return (
    (typeof data === "object" && data && (data.error || data.message)) ||
    (typeof data === "string" && data.length < 300 ? data : null) ||
    (err.code === "ECONNABORTED" ? "Request timed out. Is the ML service running?" : null) ||
    err.message ||
    "Prediction failed."
  );
}
