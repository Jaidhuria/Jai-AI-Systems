import { useState } from "react";
import { predictDiabetesRisk, mlPredictErrorMessage } from "../api/ml";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./dashboard.css";

const initialForm = {
  pregnancies: "",
  glucose: "",
  bloodPressure: "",
  skinThickness: "",
  insulin: "",
  bmi: "",
  pedigree: "",
  age: "",
};

const fieldIcons = {
  pregnancies: "fa-solid fa-baby-carriage",
  glucose: "fa-solid fa-droplet",
  bloodPressure: "fa-solid fa-heartbeat",
  skinThickness: "fa-solid fa-layer-group",
  insulin: "fa-solid fa-syringe",
  bmi: "fa-solid fa-weight-scale",
  pedigree: "fa-solid fa-chart-line",
  age: "fa-solid fa-calendar",
};

const fieldPlaceholders = {
  pregnancies: "e.g., 2",
  glucose: "mg/dL (e.g., 120)",
  bloodPressure: "mm Hg (e.g., 80)",
  skinThickness: "mm (e.g., 25)",
  insulin: "µU/mL (e.g., 85)",
  bmi: "kg/m² (e.g., 25.5)",
  pedigree: "0.0 - 2.5",
  age: "years (e.g., 35)",
};

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    // Validate required fields
    const missingFields = Object.keys(initialForm).filter(key => !formData[key]);
    if (missingFields.length > 0) {
      setError(`Please fill in all fields: ${missingFields.join(", ")}`);
      return;
    }

    try {
      setLoading(true);
      const data = await predictDiabetesRisk(formData);
      setResult(data);
    } catch (err) {
      setError(mlPredictErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleReset = () => {
    setFormData(initialForm);
    setResult(null);
    setError("");
  };

  const getRiskColor = (riskLevel) => {
    if (riskLevel?.toLowerCase().includes("high")) return "#dc2626";
    if (riskLevel?.toLowerCase().includes("moderate")) return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="dash-wrap">
      <header className="dash-header">
        <div className="header-title">
          <h1>
            <i className="fa-solid fa-heart-pulse"></i>
            HealthAI Diabetes Risk Analyzer
          </h1>
          <p className="header-subtitle">AI-powered predictive health assessment</p>
        </div>
        <div className="header-actions">
          <div className="user-badge">
            <i className="fa-solid fa-user-circle"></i>
            <span className="user-email">{user?.email}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
            Logout
          </button>
        </div>
      </header>

      <div className="stats-row">
        <div className="stat-card">
          <i className="fa-solid fa-chart-simple"></i>
          <div>
            <h4>ML Model Accuracy</h4>
            <p>94.7%</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fa-solid fa-users"></i>
          <div>
            <h4>Assessments Today</h4>
            <p>1,284</p>
          </div>
        </div>
        <div className="stat-card">
          <i className="fa-solid fa-shield-heart"></i>
          <div>
            <h4>Early Detection Rate</h4>
            <p>87%</p>
          </div>
        </div>
      </div>

      <section className="dash-card">
        <div className="card-header">
          <div>
            <h2>
              <i className="fa-solid fa-microchip"></i>
              Clinical Parameters
            </h2>
            <p className="sub-info">
              Enter patient health metrics for diabetes risk prediction using advanced ML algorithms
            </p>
          </div>
          <div className="info-badge">
            <i className="fa-regular fa-circle-question"></i>
            <span className="tooltip-text">All fields are required for accurate prediction</span>
          </div>
        </div>

        <form className="dash-grid" onSubmit={handleSubmit}>
          {Object.keys(initialForm).map((key) => (
            <div className="input-group" key={key}>
              <label>
                <i className={fieldIcons[key]}></i>
                <span>{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </label>
              <input
                type="number"
                step="any"
                name={key}
                value={formData[key]}
                onChange={handleChange}
                placeholder={fieldPlaceholders[key]}
                required
              />
            </div>
          ))}

          <div className="form-actions">
            <button type="button" className="secondary-btn" onClick={handleReset}>
              <i className="fa-solid fa-rotate-left"></i>
              Reset
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Analyzing...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-chart-line"></i>
                  Predict Diabetes Risk
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-text">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        {result && (
          <div className="result-box">
            <div className="result-header">
              <h3>
                <i className="fa-solid fa-notes-medical"></i>
                Risk Assessment Report
              </h3>
              <div className="risk-chip" style={{ background: getRiskColor(result.risk_level) + "20", color: getRiskColor(result.risk_level) }}>
                {result.risk_level || "Calculated"}
              </div>
            </div>

            <div className="prediction-row">
              <div className="pred-card">
                <div className="pred-label">Diagnosis</div>
                <div className="pred-value">
                  {result.prediction === 1 ? (
                    <span style={{ color: "#dc2626" }}>⚠️ High Chance</span>
                  ) : (
                    <span style={{ color: "#10b981" }}>✓ Low Chance</span>
                  )}
                </div>
              </div>
              <div className="pred-card">
                <div className="pred-label">Probability Score</div>
                <div className="pred-value">{result.probability}%</div>
                <div className="probability-bar">
                  <div className="prob-fill" style={{ width: `${result.probability}%` }}></div>
                </div>
              </div>
            </div>

            <div className="message-text">
              <i className="fa-regular fa-comment-dots"></i>
              {result.message}
            </div>

            {result.warnings?.length > 0 && (
              <div className="warning-list">
                <i className="fa-solid fa-triangle-exclamation"></i>
                <strong>Clinical Indicators:</strong>
                {result.warnings.map((warning, idx) => (
                  <span key={idx}>{warning}</span>
                ))}
              </div>
            )}

            <div className="recommendation-section">
              <h4>
                <i className="fa-regular fa-lightbulb"></i>
                Recommendations
              </h4>
              <ul>
                {result.prediction === 1 ? (
                  <>
                    <li>Schedule a consultation with your healthcare provider</li>
                    <li>Monitor blood glucose levels regularly</li>
                    <li>Consider dietary adjustments and physical activity</li>
                  </>
                ) : (
                  <>
                    <li>Continue maintaining healthy lifestyle habits</li>
                    <li>Regular annual check-ups recommended</li>
                    <li>Stay active and maintain balanced nutrition</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;