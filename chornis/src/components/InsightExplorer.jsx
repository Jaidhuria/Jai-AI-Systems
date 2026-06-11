import React, { useState } from "react";
import { Brain, Star, CheckCircle2, ChevronRight, HelpCircle, Info, Calendar, Sparkles } from "lucide-react";
import { synth } from "../utils/audio";

export default function InsightExplorer({ insights, selectedInsightId, setSelectedInsightId }) {
  const [activeProtocols, setActiveProtocols] = useState({});
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const activeInsight = insights.find(ins => ins.id === selectedInsightId) || insights[0];

  const handleToggleProtocol = (insightId) => {
    const isActivating = !activeProtocols[insightId];
    setActiveProtocols(prev => ({
      ...prev,
      [insightId]: isActivating
    }));
    
    if (isActivating) {
      synth.play("commit");
    } else {
      synth.play("click");
    }
  };

  const handleSelectInsight = (id) => {
    setSelectedInsightId(id);
    synth.play("click");
  };

  const handleHover = () => {
    synth.play("hoverTick");
  };

  const getImpactBadge = (impact) => {
    switch (impact) {
      case "High": return <span className="badge-high">High Impact</span>;
      case "Medium": return <span className="badge-medium">Medium Impact</span>;
      default: return <span className="badge-low">Low Impact</span>;
    }
  };

  // Bezier curve calculations for smooth line graphs
  const getBezierPath = (points) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      // Control points horizontally offset to create organic S-curves
      const cp1x = p0.x + 20;
      const cp1y = p0.y;
      const cp2x = p1.x - 20;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const getBezierAreaPath = (points) => {
    const linePath = getBezierPath(points);
    if (!linePath) return "";
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    return `${linePath} L ${lastPoint.x} 170 L ${firstPoint.x} 170 Z`;
  };

  // Helper to render custom SVG charts based on insight ID
  const renderEvidenceChart = (insight) => {
    const data = insight.chartData;
    if (!data) return null;

    if (insight.id === "insight-caffeine") {
      const linePoints = data.map((d, index) => ({
        x: 65 + index * 60 + 12,
        y: 170 - (d.delay / 150) * 140 // max delay 150m
      }));
      const bezierLine = getBezierPath(linePoints);
      const bezierArea = getBezierAreaPath(linePoints);

      return (
        <div className="custom-chart-wrapper">
          <div className="chart-legend">
            <div className="legend-item"><span className="legend-dot focus" /> Focus Duration (mins)</div>
            <div className="legend-item"><span className="legend-dot delay" /> Caffeine Delay (mins)</div>
          </div>
          
          {/* Interactive Tooltip Bubble */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div className="chart-tooltip-bubble fade-in">
              <span className="tooltip-day">{data[hoveredIndex].day}</span>
              <span className="tooltip-val">
                <span className="legend-dot focus" style={{ display: "inline-block", width: 6, height: 6 }} /> Focus: {data[hoveredIndex].focus} mins
              </span>
              <span className="tooltip-val">
                <span className="legend-dot delay" style={{ display: "inline-block", width: 6, height: 6 }} /> Delay: {data[hoveredIndex].delay} mins
              </span>
            </div>
          )}

          <svg viewBox="0 0 500 220" className="svg-chart">
            <defs>
              <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="caffeineLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="40" y1="20" x2="480" y2="20" className="chart-grid-line" />
            <line x1="40" y1="70" x2="480" y2="70" className="chart-grid-line" />
            <line x1="40" y1="120" x2="480" y2="120" className="chart-grid-line" />
            <line x1="40" y1="170" x2="480" y2="170" className="chart-grid-line" />

            {/* Hover Vertical Guide Line */}
            {hoveredIndex !== null && (
              <line 
                x1={65 + hoveredIndex * 60 + 12} 
                y1="20" 
                x2={65 + hoveredIndex * 60 + 12} 
                y2="170" 
                stroke="rgba(167, 139, 250, 0.35)" 
                strokeWidth="1.5" 
                strokeDasharray="3 3" 
              />
            )}

            {/* Bars for Focus Duration */}
            {data.map((d, index) => {
              const xPos = 65 + index * 60;
              const barHeight = (d.focus / 120) * 150; // Max focus 120 mins
              const yPos = 170 - barHeight;
              const isHovered = index === hoveredIndex;
              
              return (
                <g key={`focus-bar-${index}`} className="chart-group">
                  <rect
                    x={xPos}
                    y={yPos}
                    width="24"
                    height={barHeight}
                    rx="4"
                    className={`chart-bar focus ${isHovered ? "hovered" : ""}`}
                    style={{ fill: "url(#focusGrad)", opacity: hoveredIndex === null || isHovered ? 1 : 0.4 }}
                  />
                  <text x={xPos + 12} y={yPos - 6} className="chart-bar-value" textAnchor="middle" style={{ opacity: isHovered ? 1 : 0.6 }}>
                    {d.focus}m
                  </text>
                </g>
              );
            })}

            {/* Area under Caffeine Delay Curve */}
            <path
              d={bezierArea}
              fill="url(#caffeineLineGrad)"
              style={{ opacity: hoveredIndex === null ? 0.85 : 0.4 }}
            />

            {/* Glow backing line */}
            <path
              d={bezierLine}
              fill="none"
              stroke="#fb7185"
              strokeWidth="5.5"
              style={{ opacity: 0.18, filter: "blur(2.2px)" }}
            />

            {/* Solid line */}
            <path
              d={bezierLine}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Nodes for Caffeine Delay Line */}
            {data.map((d, index) => {
              const x = 65 + index * 60 + 12;
              const y = 170 - (d.delay / 150) * 140;
              const isHovered = index === hoveredIndex;
              return (
                <g key={`delay-dot-${index}`}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isHovered ? 7 : 4.5} 
                    className={`chart-dot delay ${isHovered ? "hovered" : ""}`} 
                    style={{ fill: "#030305", stroke: "#f43f5e", strokeWidth: 2.5 }}
                  />
                  {isHovered && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={11} 
                      className="ping-glow"
                      style={{ fill: "none", stroke: "#fb7185", strokeWidth: 1.5, opacity: 0.5 }}
                    />
                  )}
                  <text x={x} y={y - 12} className="chart-line-value" textAnchor="middle" style={{ opacity: isHovered ? 1 : 0.6 }}>
                    {d.delay}m
                  </text>
                </g>
              );
            })}

            {/* X Axis labels */}
            {data.map((d, index) => (
              <text key={`label-${index}`} x={65 + index * 60 + 12} y="195" className="chart-axis-label" textAnchor="middle">
                {d.day}
              </text>
            ))}

            {/* Interactive Hover-Catching rects */}
            {data.map((d, index) => {
              const xPos = 65 + index * 60;
              return (
                <rect
                  key={`hover-rect-${index}`}
                  x={xPos - 10}
                  y="15"
                  width="44"
                  height="165"
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => { setHoveredIndex(index); synth.play("hoverTick"); }}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
        </div>
      );
    } else if (insight.id === "insight-screentime") {
      const linePoints = data.map((d, index) => ({
        x: 65 + index * 60 + 10,
        y: 170 - (d.sleepQuality / 100) * 140 // max sleep 100
      }));
      const bezierLine = getBezierPath(linePoints);
      const bezierArea = getBezierAreaPath(linePoints);

      return (
        <div className="custom-chart-wrapper">
          <div className="chart-legend">
            <div className="legend-item"><span className="legend-dot sleep" /> Sleep Quality (%)</div>
            <div className="legend-item"><span className="legend-dot screen" /> Evening Screen Time (mins)</div>
          </div>

          {/* Interactive Tooltip Bubble */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div className="chart-tooltip-bubble fade-in">
              <span className="tooltip-day">{data[hoveredIndex].day}</span>
              <span className="tooltip-val">
                <span className="legend-dot sleep" style={{ display: "inline-block", width: 6, height: 6 }} /> Sleep Quality: {data[hoveredIndex].sleepQuality}%
              </span>
              <span className="tooltip-val">
                <span className="legend-dot screen" style={{ display: "inline-block", width: 6, height: 6 }} /> Screen Time: {data[hoveredIndex].screenMinutes} mins
              </span>
            </div>
          )}

          <svg viewBox="0 0 500 220" className="svg-chart">
            <defs>
              <linearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fb7185" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="sleepLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            <line x1="40" y1="20" x2="480" y2="20" className="chart-grid-line" />
            <line x1="40" y1="70" x2="480" y2="70" className="chart-grid-line" />
            <line x1="40" y1="120" x2="480" y2="120" className="chart-grid-line" />
            <line x1="40" y1="170" x2="480" y2="170" className="chart-grid-line" />

            {/* Hover Vertical Guide Line */}
            {hoveredIndex !== null && (
              <line 
                x1={65 + hoveredIndex * 60 + 10} 
                y1="20" 
                x2={65 + hoveredIndex * 60 + 10} 
                y2="170" 
                stroke="rgba(52, 211, 153, 0.35)" 
                strokeWidth="1.5" 
                strokeDasharray="3 3" 
              />
            )}

            {/* Screen Time Bars */}
            {data.map((d, index) => {
              const xPos = 65 + index * 60;
              const barHeight = (d.screenMinutes / 150) * 140; // Max screen 150 mins
              const yPos = 170 - barHeight;
              const isHovered = index === hoveredIndex;
              
              return (
                <g key={`screen-bar-${index}`} className="chart-group">
                  <rect
                    x={xPos}
                    y={yPos}
                    width="20"
                    height={barHeight}
                    rx="4"
                    className={`chart-bar screen ${isHovered ? "hovered" : ""}`}
                    style={{ fill: "url(#screenGrad)", opacity: hoveredIndex === null || isHovered ? 1 : 0.4 }}
                  />
                  <text x={xPos + 10} y={yPos - 6} className="chart-bar-value" textAnchor="middle" style={{ opacity: isHovered ? 1 : 0.6 }}>
                    {d.screenMinutes}m
                  </text>
                </g>
              );
            })}

            {/* Area under Sleep Quality Curve */}
            <path
              d={bezierArea}
              fill="url(#sleepLineGrad)"
              style={{ opacity: hoveredIndex === null ? 0.85 : 0.4 }}
            />

            {/* Sleep Quality Glow Line */}
            <path
              d={bezierLine}
              fill="none"
              stroke="#34d399"
              strokeWidth="5.5"
              style={{ opacity: 0.18, filter: "blur(2.2px)" }}
            />

            {/* Sleep Quality Solid Line */}
            <path
              d={bezierLine}
              fill="none"
              stroke="#34d399"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Sleep Quality Nodes */}
            {data.map((d, index) => {
              const x = 65 + index * 60 + 10;
              const y = 170 - (d.sleepQuality / 100) * 140;
              const isHovered = index === hoveredIndex;
              return (
                <g key={`sleep-dot-${index}`}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isHovered ? 7 : 4.5} 
                    className={`chart-dot sleep ${isHovered ? "hovered" : ""}`}
                    style={{ fill: "#030305", stroke: "#34d399", strokeWidth: 2.5 }}
                  />
                  {isHovered && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={11} 
                      className="ping-glow animate-pulse-slow"
                      style={{ fill: "none", stroke: "#34d399", strokeWidth: 1.5, opacity: 0.5 }}
                    />
                  )}
                  <text x={x} y={y - 12} className="chart-line-value" textAnchor="middle" style={{ opacity: isHovered ? 1 : 0.6 }}>
                    {d.sleepQuality}%
                  </text>
                </g>
              );
            })}

            {/* X Axis */}
            {data.map((d, index) => (
              <text key={`label-${index}`} x={65 + index * 60 + 10} y="195" className="chart-axis-label" textAnchor="middle">
                {d.day}
              </text>
            ))}

            {/* Hover detection overlay */}
            {data.map((d, index) => {
              const xPos = 65 + index * 60;
              return (
                <rect
                  key={`hover-rect-${index}`}
                  x={xPos - 10}
                  y="15"
                  width="40"
                  height="165"
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => { setHoveredIndex(index); synth.play("hoverTick"); }}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
        </div>
      );
    } else {
      const linePoints = data.map((d, index) => ({
        x: 65 + index * 60 + 10,
        y: 170 - (d.hrv / 100) * 140
      }));
      const bezierLine = getBezierPath(linePoints);
      const bezierArea = getBezierAreaPath(linePoints);

      return (
        <div className="custom-chart-wrapper">
          <div className="chart-legend">
            <div className="legend-item"><span className="legend-dot hrv" /> HRV (ms)</div>
            <div className="legend-item"><span className="legend-dot cardio" /> Cardio Activity (mins)</div>
          </div>

          {/* Interactive Tooltip Bubble */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div className="chart-tooltip-bubble fade-in">
              <span className="tooltip-day">{data[hoveredIndex].day}</span>
              <span className="tooltip-val">
                <span className="legend-dot hrv" style={{ display: "inline-block", width: 6, height: 6 }} /> HRV: {data[hoveredIndex].hrv} ms
              </span>
              <span className="tooltip-val">
                <span className="legend-dot cardio" style={{ display: "inline-block", width: 6, height: 6 }} /> Cardio: {data[hoveredIndex].cardioMinutes} mins
              </span>
            </div>
          )}

          <svg viewBox="0 0 500 220" className="svg-chart">
            <defs>
              <linearGradient id="cardioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
              </linearGradient>
              <linearGradient id="hrvLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.00" />
              </linearGradient>
            </defs>

            <line x1="40" y1="20" x2="480" y2="20" className="chart-grid-line" />
            <line x1="40" y1="70" x2="480" y2="70" className="chart-grid-line" />
            <line x1="40" y1="120" x2="480" y2="120" className="chart-grid-line" />
            <line x1="40" y1="170" x2="480" y2="170" className="chart-grid-line" />

            {/* Hover Vertical Guide Line */}
            {hoveredIndex !== null && (
              <line 
                x1={65 + hoveredIndex * 60 + 10} 
                y1="20" 
                x2={65 + hoveredIndex * 60 + 10} 
                y2="170" 
                stroke="rgba(96, 165, 250, 0.35)" 
                strokeWidth="1.5" 
                strokeDasharray="3 3" 
              />
            )}

            {/* Cardio Duration Bars */}
            {data.map((d, index) => {
              const xPos = 65 + index * 60;
              const barHeight = (d.cardioMinutes / 60) * 140; // Max cardio 60 mins
              const yPos = 170 - barHeight;
              const isHovered = index === hoveredIndex;
              
              return (
                <g key={`cardio-bar-${index}`} className="chart-group">
                  <rect
                    x={xPos}
                    y={yPos}
                    width="20"
                    height={barHeight}
                    rx="4"
                    className={`chart-bar cardio ${isHovered ? "hovered" : ""}`}
                    style={{ fill: "url(#cardioGrad)", opacity: hoveredIndex === null || isHovered ? 1 : 0.4 }}
                  />
                  <text x={xPos + 10} y={yPos - 6} className="chart-bar-value" textAnchor="middle" style={{ opacity: isHovered ? 1 : 0.6 }}>
                    {d.cardioMinutes}m
                  </text>
                </g>
              );
            })}

            {/* Area under HRV Curve */}
            <path
              d={bezierArea}
              fill="url(#hrvLineGrad)"
              style={{ opacity: hoveredIndex === null ? 0.85 : 0.4 }}
            />

            {/* HRV Glow Line */}
            <path
              d={bezierLine}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="5.5"
              style={{ opacity: 0.18, filter: "blur(2.2px)" }}
            />

            {/* HRV Solid Line */}
            <path
              d={bezierLine}
              fill="none"
              stroke="#60a5fa"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* HRV Nodes */}
            {data.map((d, index) => {
              const x = 65 + index * 60 + 10;
              const y = 170 - (d.hrv / 100) * 140;
              const isHovered = index === hoveredIndex;
              return (
                <g key={`hrv-dot-${index}`}>
                  <circle 
                    cx={x} 
                    cy={y} 
                    r={isHovered ? 7 : 4.5} 
                    className={`chart-dot hrv ${isHovered ? "hovered" : ""}`}
                    style={{ fill: "#030305", stroke: "#60a5fa", strokeWidth: 2.5 }}
                  />
                  {isHovered && (
                    <circle 
                      cx={x} 
                      cy={y} 
                      r={11} 
                      className="ping-glow"
                      style={{ fill: "none", stroke: "#60a5fa", strokeWidth: 1.5, opacity: 0.5 }}
                    />
                  )}
                  <text x={x} y={y - 12} className="chart-line-value" textAnchor="middle" style={{ opacity: isHovered ? 1 : 0.6 }}>
                    {d.hrv}ms
                  </text>
                </g>
              );
            })}

            {/* X Axis */}
            {data.map((d, index) => (
              <text key={`label-${index}`} x={65 + index * 60 + 10} y="195" className="chart-axis-label" textAnchor="middle">
                {d.day}
              </text>
            ))}

            {/* Hover detection overlay */}
            {data.map((d, index) => {
              const xPos = 65 + index * 60;
              return (
                <rect
                  key={`hover-rect-${index}`}
                  x={xPos - 10}
                  y="15"
                  width="40"
                  height="165"
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => { setHoveredIndex(index); synth.play("hoverTick"); }}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </svg>
        </div>
      );
    }
  };

  return (
    <div className="insight-explorer-layout fade-in">
      {/* Sidebar List */}
      <div className="explorer-sidebar glass-panel">
        <h3 className="sidebar-title font-sans">Select Insight</h3>
        <div className="sidebar-items">
          {insights.map((insight) => {
            const isSelected = insight.id === selectedInsightId;
            const isProtocolActive = activeProtocols[insight.id];

            return (
              <div
                key={insight.id}
                onClick={() => handleSelectInsight(insight.id)}
                onMouseEnter={handleHover}
                className={`sidebar-item ${isSelected ? "selected" : ""}`}
              >
                <div className="sidebar-item-header">
                  <span className="insight-category">{insight.category}</span>
                  {isProtocolActive && (
                    <span className="protocol-status-badge">
                      <Sparkles size={10} /> Active
                    </span>
                  )}
                </div>
                <h4 className="insight-item-title">{insight.title}</h4>
                <div className="sidebar-item-footer">
                  <span className="sidebar-impact">Impact: {insight.impact}</span>
                  <span className="sidebar-confidence">Conf: {insight.confidence}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Details Pane */}
      <div className="explorer-content glass-panel">
        <div className="explorer-header">
          <div className="category-row">
            <span className="insight-category-large">{activeInsight.category}</span>
            <div className="header-badges">
              {getImpactBadge(activeInsight.impact)}
              <span className="confidence-percentage-badge">
                {activeInsight.confidence}% Confidence
              </span>
            </div>
          </div>
          <h2 className="insight-detail-title">{activeInsight.title}</h2>
        </div>

        <div className="explorer-body">
          <div className="detail-section">
            <p className="insight-summary-highlight">{activeInsight.summary}</p>
            <div className="divider" />
            
            <h4 className="body-section-title font-sans" style={{ fontSize: 14 }}>Physiological Mechanism</h4>
            <p className="mechanism-desc font-serif" style={{ fontSize: 16, lineHeight: 1.7 }}>
              {activeInsight.description}
            </p>
          </div>

          {/* Core supporting evidence section */}
          <div className="detail-section">
            <h4 className="body-section-title font-sans" style={{ fontSize: 14 }}>Supporting Evidence & Correlations</h4>
            <p className="section-note">Comparison metrics from the last 7 monitored cycles (Hover over items to explore detail):</p>
            
            {/* Custom SVG Chart */}
            {renderEvidenceChart(activeInsight)}

            {/* Quick summary cards of metrics */}
            <div className="evidence-grid">
              {activeInsight.supportingEvidence.map((ev, index) => (
                <div key={index} className="evidence-stat-card" onMouseEnter={handleHover}>
                  <span className="evidence-stat-label">{ev.label}</span>
                  <div className="evidence-stat-value-group">
                    <span className="evidence-stat-value">{ev.value}</span>
                    <span className="evidence-stat-unit">{ev.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Uncertainty and missing data details */}
          <div className="detail-section warning-box glass-panel" onMouseEnter={handleHover}>
            <div className="box-header text-warning">
              <HelpCircle size={18} />
              <h4 className="box-title font-sans">Uncertainty & Sensor Discrepancies</h4>
            </div>
            <p className="box-desc">{activeInsight.uncertaintyExplanation}</p>
          </div>

          {/* Actionable recommendation and logging simulator */}
          <div className="detail-section protocol-box glass-panel" onMouseEnter={handleHover}>
            <div className="box-header text-accent">
              <Brain size={18} className="animate-pulse-slow" />
              <h4 className="box-title font-sans">Recommended Intervention Protocol</h4>
            </div>
            <p className="box-desc">{activeInsight.recommendation}</p>
            
            <div className="protocol-action-area">
              <button
                className={`protocol-btn ${activeProtocols[activeInsight.id] ? "active" : ""}`}
                onClick={() => handleToggleProtocol(activeInsight.id)}
                onMouseEnter={handleHover}
              >
                {activeProtocols[activeInsight.id] ? (
                  <>
                    <CheckCircle2 size={16} />
                    <span>Protocol Active — Day 1 Tracking</span>
                  </>
                ) : (
                  <>
                    <span>{activeInsight.actionLabel}</span>
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
              
              {activeProtocols[activeInsight.id] && (
                <span className="protocol-success-msg animate-fade-in">
                  <Sparkles size={14} className="text-accent" /> Custom tracking agent launched for waking windows.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
