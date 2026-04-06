import { useState } from "react";
import { predictDiabetesRisk, mlPredictErrorMessage } from "../api/ml";
import "./risk.css";

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

function RiskPage() {
  const [formData, setFormData] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "pregnancies") {
      if (value === "" || value === "0" || value === "1") {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (formData.pregnancies !== "0" && formData.pregnancies !== "1") {
      setError("Pregnancy value must be 0 or 1");
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

  /* -------- STATUS LOGIC -------- */

  const getStatus = (name, value) => {
    if (!value) return "";

    const v = Number(value);

    switch (name) {
      case "glucose":
        if (v < 100) return "good";
        if (v < 126) return "warn";
        return "bad";

      case "bloodPressure":
        if (v < 120) return "good";
        if (v < 130) return "warn";
        return "bad";

      case "bmi":
        if (v < 25) return "good";
        if (v < 30) return "warn";
        return "bad";

      case "pedigree":
        if (v < 0.8) return "good";
        if (v < 1.2) return "warn";
        return "bad";

      case "skinThickness":
        if (v < 10) return "bad";
        return "good";

      case "insulin":
        if (v >= 16 && v <= 166) return "good";
        return "warn";

      default:
        return "";
    }
  };

  /* -------- FIELDS -------- */

  const fields = [
    {
      label: "Glucose (mg/dL)",
      name: "glucose",
      hint: "Normal: 70–99 | Pre-diabetic: 100–125 | High: 126+",
    },
    {
      label: "Blood Pressure (mmHg)",
      name: "bloodPressure",
      hint: "Normal: <120 | Elevated: 120–129 | High: 130+",
    },
    {
      label: "Skin Thickness (mm)",
      name: "skinThickness",
      hint: "Typical: 10–50 mm",
    },
    {
      label: "Insulin (uU/mL)",
      name: "insulin",
      hint: "Normal: 16–166",
    },
    {
      label: "BMI",
      name: "bmi",
      step: "0.1",
      hint: "Normal: 18.5–24.9",
    },
    {
      label: "Diabetes Pedigree",
      name: "pedigree",
      step: "0.001",
      hint: "Typical: 0.2–0.8 | High: >1",
    },
    {
      label: "Age",
      name: "age",
      hint: "Risk increases after 35+",
    },
  ];

  return (
    <section className="section active">
      <div className="form-page">

        {/* FORM CARD */}
        <div className="card form-card">
          <div className="card-header">
            <h2 className="card-title">Diabetes Risk Assessment</h2>
            <span className="tag">AI-powered</span>
          </div>

          <form className="form-body" onSubmit={onSubmit}>

            {/* Pregnancies */}
            <div className="form-group">
              <label>Pregnancies (0 or 1)</label>
              <input
                type="number"
                name="pregnancies"
                value={formData.pregnancies}
                onChange={onChange}
                min="0"
                max="1"
                step="1"
                required
              />
              <small className="input-hint">
                0 = No pregnancy, 1 = Pregnant
              </small>
            </div>

            {/* Dynamic Fields */}
            {fields.map((field) => {
              const status = getStatus(field.name, formData[field.name]);

              return (
                <div className={`form-group ${status}`} key={field.name}>
                  <label>{field.label}</label>

                  <input
                    type="number"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={onChange}
                    step={field.step || "1"}
                    required
                  />

                  <small className="input-hint">{field.hint}</small>
                </div>
              );
            })}

            <button className="btn-primary" disabled={loading}>
              {loading ? "Assessing..." : "Assess Risk"}
            </button>
          </form>

          {error && <div className="error-box">{error}</div>}

          {result && (
            <div className="result-box">
              <p><strong>Probability:</strong> {result.probability}%</p>
              <p><strong>Risk:</strong> {result.risk_level}</p>
              <p><strong>Insight:</strong> {result.message}</p>

              {result.warnings?.length > 0 && (
                <p><strong>Warnings:</strong> {result.warnings.join(", ")}</p>
              )}
            </div>
          )}
        </div>

        {/* AI PANEL */}
        <div className="card ai-panel">
          <div className="ai-top">
            <div className="ai-left">
              <div className="ai-avatar">🧠</div>
              <div>
                <h2>Risk Analysis Report</h2>
                <span className="ai-status">
                  <span className="dot"></span>
                  Live Analysis
                </span>
              </div>
            </div>

            <div className="ai-badge">ML Model v1.0</div>
          </div>

          <p className="ai-desc">
            Your inputs are analyzed using ML to estimate diabetes risk based on clinical patterns.
          </p>

          {result ? (
            <>
              <div className="ai-stats">
                <div className="stat">
                  <span>Probability</span>
                  <strong>{result.probability}%</strong>
                </div>
                <div className="stat">
                  <span>Risk</span>
                  <strong>{result.risk_level}</strong>
                </div>
                <div className="stat">
                  <span>Status</span>
                  <strong className="live">Analyzed</strong>
                </div>
              </div>

              <div className="ai-insight">
                 {result.message}
              </div>
            </>
          ) : (
            <div className="ai-insight">
              💡 Enter values and click "Assess Risk" to get insights.
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default RiskPage;