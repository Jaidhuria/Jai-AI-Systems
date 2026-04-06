import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "./log.css";

function LogPage() {
  const { data, saveData, selectedDate } = useOutletContext();
  const [value, setValue] = useState("");
  const [time, setTime] = useState("");
  const [glucoseStatus, setGlucoseStatus] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  // Function to determine glucose status and range
  const analyzeGlucoseValue = (glucoseValue) => {
    const numValue = Number(glucoseValue);
    if (isNaN(numValue) || numValue === "") return null;

    if (numValue < 70) {
      return {
        status: "Hypoglycemia",
        message: "Low blood sugar - Seek medical attention",
        color: "#dc2626",
        bgColor: "#fee2e2",
        icon: "fa-triangle-exclamation",
        recommendation: "Consume fast-acting carbohydrates (juice, glucose tablets)",
        range: "< 70 mg/dL",
        severity: "emergency"
      };
    } else if (numValue >= 70 && numValue <= 99) {
      return {
        status: "Normal (Fasting)",
        message: "Healthy glucose level",
        color: "#10b981",
        bgColor: "#d1fae5",
        icon: "fa-check-circle",
        recommendation: "Maintain current healthy habits",
        range: "70-99 mg/dL",
        severity: "normal"
      };
    } else if (numValue >= 100 && numValue <= 125) {
      return {
        status: "Prediabetes Range",
        message: "Elevated glucose - Lifestyle changes recommended",
        color: "#f59e0b",
        bgColor: "#fed7aa",
        icon: "fa-exclamation-triangle",
        recommendation: "Consult doctor, increase physical activity, reduce sugar intake",
        range: "100-125 mg/dL",
        severity: "caution"
      };
    } else if (numValue >= 126 && numValue <= 199) {
      return {
        status: "Diabetes Range",
        message: "High blood sugar - Medical attention needed",
        color: "#ef4444",
        bgColor: "#fee2e2",
        icon: "fa-heartbeat",
        recommendation: "Take prescribed medication, monitor regularly",
        range: "126-199 mg/dL",
        severity: "alert"
      };
    } else if (numValue >= 200 && numValue <= 299) {
      return {
        status: "Very High",
        message: "Very high blood sugar - Contact healthcare provider",
        color: "#dc2626",
        bgColor: "#fecaca",
        icon: "fa-bell",
        recommendation: "Emergency contact recommended",
        range: "200-299 mg/dL",
        severity: "critical"
      };
    } else if (numValue >= 300) {
      return {
        status: "Critical - Emergency",
        message: "CRITICAL LEVEL - Seek immediate medical help",
        color: "#991b1b",
        bgColor: "#fee2e2",
        icon: "fa-ambulance",
        recommendation: "Call emergency services immediately",
        range: "≥ 300 mg/dL",
        severity: "emergency"
      };
    }
    return null;
  };

  // Real-time glucose analysis
  useEffect(() => {
    if (value && value !== "") {
      const analysis = analyzeGlucoseValue(value);
      setGlucoseStatus(analysis);
      setShowWarning(analysis?.severity === "emergency" || analysis?.severity === "critical");
    } else {
      setGlucoseStatus(null);
      setShowWarning(false);
    }
  }, [value]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!value || !time) return;
    
    const numValue = Number(value);
    const analysis = analyzeGlucoseValue(numValue);
    
    // Show confirmation dialog for abnormal values
    if (analysis && (analysis.severity === "emergency" || analysis.severity === "critical")) {
      const confirm = window.confirm(
        `⚠️ WARNING: ${analysis.status}\n\nValue: ${numValue} mg/dL\n${analysis.message}\n\nAre you sure you want to log this reading?`
      );
      if (!confirm) return;
    }

    const next = { ...data };
    if (!next[selectedDate]) next[selectedDate] = [];
    next[selectedDate] = [
      ...next[selectedDate],
      {
        value: numValue,
        time,
        status: analysis?.status,
        severity: analysis?.severity,
        timestamp: new Date().toISOString()
      }
    ];
    saveData(next);
    setValue("");
    setTime("");
    setGlucoseStatus(null);
    setShowWarning(false);
  };

  const setCurrentTime = () => {
    const now = new Date();
    setTime(`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`);
  };

  return (
    <section id="section-log" className="section active">
      <div className="form-page">
        <div className="card form-card">
          <div className="card-header">
            <h2 className="card-title">Log a Reading</h2>
            <span className="tag">Quick entry</span>
          </div>
          <form className="form-body" onSubmit={onSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Glucose Value</label>
                <div className="input-wrap">
                  <input
                    type="number"
                    min="10"
                    max="700"
                    placeholder="e.g. 105"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    required
                  />
                  <span className="input-unit">mg/dL</span>
                </div>
                {value && glucoseStatus && (
                  <div className="live-feedback">
                    <i className={`fas ${glucoseStatus.icon}`} style={{ color: glucoseStatus.color }}></i>
                    <div className="feedback-content">
                      <strong style={{ color: glucoseStatus.color }}>{glucoseStatus.status}</strong>
                      <span>{glucoseStatus.message}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Time of Reading</label>
                <div className="input-wrap">
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
                <button type="button" className="btn-ghost" onClick={setCurrentTime}>
                  Use current time
                </button>
              </div>
            </div>

            {showWarning && glucoseStatus && (
              <div className="warning-banner">
                <i className={`fas ${glucoseStatus.icon}`} style={{ color: glucoseStatus.color }}></i>
                <div>
                  <strong>Medical Alert:</strong> {glucoseStatus.recommendation}
                </div>
              </div>
            )}

            <button className="btn-primary" type="submit">
              Add Reading
            </button>
          </form>

          {value && glucoseStatus && (
            <div className="quick-stats">
              <h4>Quick Analysis</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span>Current Value</span>
                  <strong style={{ color: glucoseStatus.color }}>{value} mg/dL</strong>
                </div>
                <div className="stat-item">
                  <span>Target Range</span>
                  <strong>{glucoseStatus.range}</strong>
                </div>
                <div className="stat-item">
                  <span>Status</span>
                  <strong style={{ color: glucoseStatus.color }}>{glucoseStatus.status}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="card reference-card">
          <div className="card-header">
            <h2 className="card-title">Reference Ranges</h2>
          </div>
          <div className="ref-table">
            <div className="ref-row ref-head">
              <span>Range</span>
              <span>Value (mg/dL)</span>
              <span>Status</span>
            </div>
            {[
              ["Fasting normal", "70-99", "Normal", "badge-green"],
              ["Post-meal (2h)", "<140", "Normal", "badge-green"],
              ["Prediabetes (fast)", "100-125", "Caution", "badge-amber"],
              ["Diabetic (fast)", ">=126", "Alert", "badge-red"],
              ["Hypoglycemia", "<70", "Urgent", "badge-red"],
              ["Crisis high", ">300", "Emergency", "badge-red"],
            ].map(([range, val, label, badgeClass]) => (
              <div key={range} className="ref-row">
                <span>{range}</span>
                <span>{val}</span>
                <span className={`badge ${badgeClass}`}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogPage;