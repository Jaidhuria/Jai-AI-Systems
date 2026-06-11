import React, { useState } from "react";
import { Calendar, ArrowRight, CheckCircle2, TrendingUp, Sparkles, Award } from "lucide-react";
import { synth } from "../utils/audio";

export default function NarrativeTimeline({ timelineEpochs }) {
  const [activeEpochIndex, setActiveEpochIndex] = useState(2); // default to current (last)
  const currentEpoch = timelineEpochs[activeEpochIndex];

  // State for the compounding predictor slider
  const [sliderVal, setSliderVal] = useState(12); // default 12 months (1 year)

  const handleSelectEpoch = (index) => {
    setActiveEpochIndex(index);
    synth.play("click");
  };

  const handleHover = () => {
    synth.play("hoverTick");
  };

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    if (val !== sliderVal) {
      setSliderVal(val);
      synth.play("hoverTick");
    }
  };

  // Math models for compounding physiological projections
  const calculateProjections = (months) => {
    return {
      hrv: Math.round(8 + (30 * (months - 1)) / (months + 8)),
      sleepDebt: Math.round(months * 10.4),
      focus: Math.round(15 + (45 * (months - 1)) / (months + 6)),
      bioAge: (0.1 + (3.4 * (months - 1)) / (months + 10)).toFixed(1)
    };
  };

  const projections = calculateProjections(sliderVal);

  return (
    <div className="timeline-layout fade-in">
      {/* Interactive Step Slider Header */}
      <div className="timeline-header-panel glass-panel">
        <h2 className="section-title text-center">Behavioral Evolution Timeline</h2>
        <p className="section-subtitle text-center">
          Trace how small changes in your routines compounded into systemic health and performance improvements.
        </p>

        <div className="timeline-stepper">
          {/* Connecting line */}
          <div className="stepper-line">
            <div 
              className="stepper-line-progress" 
              style={{ width: `${(activeEpochIndex / (timelineEpochs.length - 1)) * 100}%` }}
            />
          </div>

          <div className="stepper-nodes">
            {timelineEpochs.map((epoch, index) => {
              const isActive = index === activeEpochIndex;
              const isPast = index < activeEpochIndex;
              
              return (
                <div 
                  key={epoch.id} 
                  className={`stepper-node-container ${isActive ? "active" : ""} ${isPast ? "past" : ""}`}
                  onClick={() => handleSelectEpoch(index)}
                  onMouseEnter={handleHover}
                >
                  <div className="stepper-node">
                    {isPast ? <CheckCircle2 size={16} /> : <span>{index + 1}</span>}
                  </div>
                  <div className="stepper-node-label">
                    <span className="epoch-title-short">{epoch.title}</span>
                    <span className="epoch-period-short">{epoch.period}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Epoch Detail Grid */}
      <div className="epoch-detail-grid">
        {/* Left Card: Summary & Narrative */}
        <div className="epoch-main-card glass-panel" onMouseEnter={handleHover}>
          <div className="epoch-card-header">
            <div className="epoch-phase-badge">
              <Calendar size={14} />
              <span>{currentEpoch.period}</span>
            </div>
            <span className={`epoch-status-badge status-${currentEpoch.status.toLowerCase().replace(" ", "-")}`}>
              {currentEpoch.status}
            </span>
          </div>

          <h3 className="epoch-detail-title">{currentEpoch.title}</h3>
          <p className="epoch-description">{currentEpoch.description}</p>
          
          <div className="divider" />
          
          <div className="discoveries-section">
            <h4 className="body-section-title">Key Discoveries</h4>
            <ul className="discoveries-list">
              {currentEpoch.findings.map((finding, idx) => (
                <li key={idx} className="discovery-item">
                  <ArrowRight size={14} className="discovery-icon" />
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="outcome-section warning-box glass-panel">
            <div className="box-header text-accent">
              <Award size={18} />
              <h4 className="box-title">Epoch Impact & Next Lever</h4>
            </div>
            <p className="box-desc">{currentEpoch.outcome}</p>
          </div>
        </div>

        {/* Right Columns: Metrics & Simulator */}
        <div className="epoch-stats-right-wrapper">
          {/* Metrics Comparison Card */}
          <div className="epoch-stats-card-panel glass-panel" onMouseEnter={handleHover}>
            <h3 className="stats-card-title">Metrics During This Phase</h3>
            <p className="stats-card-subtitle">Values calculated over the active period.</p>

            <div className="epoch-metrics-list">
              <div className="epoch-metric-row">
                <div className="metric-meta">
                  <span className="metric-meta-name">Sleep Quality</span>
                  <span className="metric-meta-value">{currentEpoch.metrics.sleepQuality}</span>
                </div>
                <div className="metric-compare-bar-bg">
                  <div 
                    className="metric-compare-bar-fill sleep" 
                    style={{ width: `${parseFloat(currentEpoch.metrics.sleepQuality)}%` }}
                  />
                </div>
              </div>

              <div className="epoch-metric-row">
                <div className="metric-meta">
                  <span className="metric-meta-name">Caffeine Delay</span>
                  <span className="metric-meta-value">{currentEpoch.metrics.caffeineDelay}</span>
                </div>
                <div className="metric-compare-bar-bg">
                  <div 
                    className="metric-compare-bar-fill caffeine" 
                    style={{ width: `${Math.min((parseFloat(currentEpoch.metrics.caffeineDelay) / 120) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="epoch-metric-row">
                <div className="metric-meta">
                  <span className="metric-meta-name">Evening Screen Time</span>
                  <span className="metric-meta-value">{currentEpoch.metrics.eveningScreen}</span>
                </div>
                <div className="metric-compare-bar-bg">
                  <div 
                    className="metric-compare-bar-fill screentime" 
                    style={{ width: `${(parseFloat(currentEpoch.metrics.eveningScreen) / 4) * 100}%` }}
                  />
                </div>
              </div>

              <div className="epoch-metric-row">
                <div className="metric-meta">
                  <span className="metric-meta-name">Daily Focus Duration</span>
                  <span className="metric-meta-value">{currentEpoch.metrics.focusDuration}</span>
                </div>
                <div className="metric-compare-bar-bg">
                  <div 
                    className="metric-compare-bar-fill focus" 
                    style={{ width: `${(parseFloat(currentEpoch.metrics.focusDuration) / 6) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Comparative analysis box */}
            <div className="timeline-trend-box">
              <h4 className="trend-box-title">System Evolution Highlight</h4>
              {activeEpochIndex === 0 && (
                <p className="trend-box-desc">
                  High evening screen exposure and caffeine crashes define your baseline behavior. Focus capacity remains depressed.
                </p>
              )}
              {activeEpochIndex === 1 && (
                <p className="trend-box-desc">
                  <TrendingUp size={14} className="text-success inline-icon" /> 
                  <strong>Focus Alert:</strong> Delaying morning coffee resolved adenosine crash loops, restoring morning focus (+61%) while keeping sleep metrics baseline stable.
                </p>
              )}
              {activeEpochIndex === 2 && (
                <p className="trend-box-desc">
                  <Sparkles size={14} className="text-accent inline-icon" /> 
                  <strong>Compounding Gains:</strong> Screen curfew combined with coffee latency yielded best overall score. Sleep latency decreased by 21 minutes, compounding into higher daytime alertness.
                </p>
              )}
            </div>
          </div>

          {/* Compounding Predictor Simulator Widget (Unique Enhancement) */}
          <div className="compounding-predictor-panel glass-panel" onMouseEnter={handleHover}>
            <div className="predictor-header">
              <Sparkles className="text-accent animate-pulse-slow" size={16} />
              <h3 className="predictor-title font-sans">Compounding Benefit Predictor</h3>
            </div>
            <p className="predictor-subtitle">Drag the slider to project long-term physiological improvements from routine alignment.</p>
            
            <div className="slider-wrapper">
              <div className="slider-meta">
                <span className="slider-label">Duration of Routine</span>
                <span className="slider-val text-accent">
                  {sliderVal} {sliderVal === 1 ? "Month" : sliderVal < 12 ? "Months" : sliderVal === 12 ? "Year (12m)" : `Years (${(sliderVal/12).toFixed(1)} yr)`}
                </span>
              </div>
              
              <input 
                type="range" 
                min="1" 
                max="36" 
                value={sliderVal} 
                onChange={handleSliderChange} 
                className="custom-range-slider"
              />
              
              <div className="range-ticks font-sans">
                <span>1m</span>
                <span>6m</span>
                <span>12m</span>
                <span>24m</span>
                <span>36m</span>
              </div>
            </div>

            <div className="predictor-results-grid">
              <div className="result-card">
                <span className="result-label">HRV Recovery</span>
                <span className="result-value text-accent">+{projections.hrv} ms</span>
                <span className="result-sub">nervous balance</span>
              </div>
              <div className="result-card">
                <span className="result-label">Sleep Debt Saved</span>
                <span className="result-value text-success">{projections.sleepDebt} hrs</span>
                <span className="result-sub">cumulative recovery</span>
              </div>
              <div className="result-card">
                <span className="result-label">Focus Capacity</span>
                <span className="result-value text-info">+{projections.focus}%</span>
                <span className="result-sub">alertness window</span>
              </div>
              <div className="result-card">
                <span className="result-label">Cellular Aging</span>
                <span className="result-value text-danger">-{projections.bioAge} yrs</span>
                <span className="result-sub">biological load</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
