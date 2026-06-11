import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, RefreshCw, AlertTriangle, CheckCircle, Info, ChevronRight, Activity, Terminal } from "lucide-react";
import { synth } from "../utils/audio";

export default function Dashboard({ metrics, recentChanges, confidenceIndicators, onSelectMetric, onSelectInsight }) {
  // Map metric IDs to standard insight IDs in our mockData
  const metricToInsightMap = {
    sleep: "insight-screentime", // screen time affects sleep
    focus: "insight-caffeine",    // caffeine affects focus
    activity: "insight-hrv-exercise", // cardio exercise affects HRV
    screentime: "insight-screentime"
  };

  // State for live rolling telemetry feed
  const [telemetryLogs, setTelemetryLogs] = useState([
    "[13:40:01] Initial biosensor telemetry connection established.",
    "[13:41:12] Apple Watch activity sync: [OK] - 420 kcal parsed.",
    "[13:42:55] Sleep offset calculation: melatonin baseline sync [OK]."
  ]);

  useEffect(() => {
    const logTemplates = [
      "Watch sensor sync: Heart Rate sampled at 68 bpm.",
      "Melatonin phase shift detection: Cortisol clearance forecast updated.",
      "Friction index: Evening screen exposure duration warning.",
      "Adenosine level estimate: 89% clearance baseline achieved.",
      "Circadian check: sleep offset delta +12 mins.",
      "Cognitive capacity log: typing latency stable.",
      "HRV recovery surge: nocturnal vagal tone index +8ms.",
      "Ambient blue light index peak registered via phone display API.",
      "Apple Watch accelerometer sync: [OK] - Delta-Y 0.04g.",
      "Chronis server check: encryption protocol handshake successful."
    ];

    const interval = setInterval(() => {
      const randomLog = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTelemetryLogs((prev) => {
        const nextLogs = [...prev, `[${timestamp}] ${randomLog}`];
        if (nextLogs.length > 5) {
          nextLogs.shift();
        }
        return nextLogs;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  const handleMetricClick = (metricId) => {
    const insightId = metricToInsightMap[metricId];
    if (insightId) {
      synth.play("click");
      onSelectInsight(insightId);
      onSelectMetric(metricId);
    }
  };

  const playHover = () => {
    synth.play("hoverTick");
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "positive": return "badge-positive";
      case "negative": return "badge-negative";
      case "warning": return "badge-warning";
      default: return "badge-neutral";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="indicator-icon text-success" size={16} />;
      case "intermittent":
        return <AlertTriangle className="indicator-icon text-warning animate-pulse-slow" size={16} />;
      case "missing":
        return <AlertTriangle className="indicator-icon text-danger" size={16} />;
      default:
        return <Info className="indicator-icon" size={16} />;
    }
  };

  const getSparklinePaths = (id) => {
    switch (id) {
      case "sleep":
        return {
          line: "M0,25 Q15,10 30,18 T60,5 T90,8 T100,2",
          fill: "M0,25 Q15,10 30,18 T60,5 T90,8 T100,2 L100,30 L0,30 Z"
        };
      case "focus":
        return {
          line: "M0,5 Q15,8 30,22 T60,25 T90,12 T100,28",
          fill: "M0,5 Q15,8 30,22 T60,25 T90,12 T100,28 L100,30 L0,30 Z"
        };
      case "activity":
        return {
          line: "M0,28 Q15,22 30,12 T60,15 T90,5 T100,2",
          fill: "M0,28 Q15,22 30,12 T60,15 T90,5 T100,2 L100,30 L0,30 Z"
        };
      default:
        return {
          line: "M0,28 Q15,10 30,15 T60,5 T90,20 T100,10",
          fill: "M0,28 Q15,10 30,15 T60,5 T90,20 T100,10 L100,30 L0,30 Z"
        };
    }
  };

  return (
    <div className="dashboard-grid fade-in">
      {/* Metric Cards Row */}
      <div className="full-width-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Behavioral Trends</h2>
            <p className="section-subtitle">Real-time aggregate data across your active devices. Click any card to inspect related insight.</p>
          </div>
          <div className="last-sync" onMouseEnter={playHover} onClick={() => synth.play("click")}>
            <RefreshCw size={14} className="spin-on-hover" />
            <span>Updated 4 mins ago</span>
          </div>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric) => {
            const isPositive = metric.status === "positive";
            const isWarning = metric.status === "warning";
            const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
            const paths = getSparklinePaths(metric.id);

            return (
              <div 
                key={metric.id} 
                className={`metric-card glass-panel interactive-card`}
                onClick={() => handleMetricClick(metric.id)}
                onMouseEnter={playHover}
                style={{ "--accent-color": metric.color }}
              >
                <div className="metric-card-header">
                  <span className="metric-name">{metric.name}</span>
                  <div className={`trend-badge ${isPositive ? "trend-up" : isWarning ? "trend-warning" : "trend-down"}`}>
                    <TrendIcon size={14} />
                    <span>{metric.change}</span>
                  </div>
                </div>

                <div className="metric-body">
                  <div className="metric-value-container">
                    <span className="metric-value">{metric.value}</span>
                    <span className="metric-unit">{metric.unit}</span>
                  </div>
                  
                  {/* SVG mini line chart with linear gradient area fill */}
                  <div className="mini-chart">
                    <svg viewBox="0 0 100 30" className="sparkline">
                      <defs>
                        <linearGradient id={`grad-${metric.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={metric.color} stopOpacity="0.45" />
                          <stop offset="100%" stopColor={metric.color} stopOpacity="0.00" />
                        </linearGradient>
                      </defs>
                      {/* Area Fill */}
                      <path
                        d={paths.fill}
                        fill={`url(#grad-${metric.id})`}
                      />
                      {/* Stroke Line */}
                      <path
                        d={paths.line}
                        fill="none"
                        stroke={metric.color}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="metric-card-footer">
                  <div className="confidence-meter-container">
                    <span className="confidence-label">Confidence</span>
                    <div className="confidence-bar-bg">
                      <div 
                        className="confidence-bar-fill" 
                        style={{ 
                          width: `${metric.confidence}%`,
                          backgroundColor: metric.color 
                        }}
                      />
                    </div>
                    <span className="confidence-value">{metric.confidence}%</span>
                  </div>
                </div>
                <div className="metric-hover-hint">
                  <span>Explore Evidence</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Columns: Left (Recent Changes), Right (Confidence details) */}
      <div className="left-column">
        <div className="section-header">
          <div>
            <h2 className="section-title">Recent Changes & Shifts</h2>
            <p className="section-subtitle">Behavioral drift detected compared to your historical baseline.</p>
          </div>
        </div>

        <div className="changes-list">
          {recentChanges.map((change) => (
            <div 
              key={change.id} 
              className="change-item glass-panel"
              onMouseEnter={playHover}
            >
              <div className="change-item-header">
                <div className="change-title-group">
                  <span className={`severity-indicator ${change.severity}`} />
                  <h3 className="change-title">{change.title}</h3>
                </div>
                <span className="change-time">{change.time}</span>
              </div>
              <p className="change-desc">{change.description}</p>
              
              {/* Context link */}
              {change.id === "change-1" && (
                <div className="change-action-link" onClick={() => handleMetricClick("screentime")}>
                  <span>Inspect evening screen correlation</span>
                  <ChevronRight size={12} />
                </div>
              )}
              {change.id === "change-3" && (
                <div className="change-action-link" onClick={() => handleMetricClick("focus")}>
                  <span>Inspect caffeine circadian link</span>
                  <ChevronRight size={12} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="right-column">
        <div className="section-header">
          <div>
            <h2 className="section-title">Data Quality & Calibration</h2>
            <p className="section-subtitle">Active sensor pipelines and logging fidelity.</p>
          </div>
        </div>

        <div className="confidence-sources glass-panel" onMouseEnter={playHover}>
          <div className="overall-confidence-header">
            <span className="overall-title">Aggregate System Confidence</span>
            <div className="radial-score-container">
              <svg viewBox="0 0 36 36" className="circular-chart">
                <path className="circle-bg"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path className="circle-fill"
                  strokeDasharray="89, 100"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <text x="18" y="20.35" className="percentage">89%</text>
              </svg>
            </div>
          </div>
          
          <div className="divider" />

          {/* Scrolling Telemetry Feed Terminal (Unique Enhancement) */}
          <div className="telemetry-live-log-container">
            <div className="live-log-header">
              <Terminal size={12} className="text-accent animate-pulse-slow" />
              <span>LIVE TELEMETRY STREAM</span>
              <span className="pulse-green-dot" />
            </div>
            <div className="live-log-terminal">
              {telemetryLogs.map((log, index) => (
                <div key={index} className="live-log-line">
                  <span className="line-pointer">&gt;&gt;</span> {log}
                </div>
              ))}
              <div className="live-log-cursor" />
            </div>
          </div>

          <div className="divider" />

          <div className="sources-list">
            {confidenceIndicators.map((indicator) => (
              <div key={indicator.id} className={`source-item status-${indicator.status}`} onMouseEnter={playHover}>
                <div className="source-item-header">
                  <div className="source-name-group">
                    {getStatusIcon(indicator.status)}
                    <span className="source-name">{indicator.source}</span>
                  </div>
                  <span className="source-reliability">{indicator.reliability} Reliability</span>
                </div>
                <p className="source-explanation">{indicator.explanation}</p>
                <p className="source-impact">
                  <strong>Impact:</strong> {indicator.impact}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
