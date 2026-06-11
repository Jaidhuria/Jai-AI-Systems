import React from "react";
import { Award, Compass, Scale, Zap, CheckCircle } from "lucide-react";

export default function ProductJudgment() {
  return (
    <div className="product-judgment-layout fade-in">
      <div className="judgment-header glass-panel">
        <div className="badge-wrapper">
          <Award className="text-accent animate-pulse-slow" size={24} />
        </div>
        <h2 className="section-title font-sans">Product Judgment & Rationale</h2>
        <p className="section-subtitle">
          Assessment Component 4 — Analyzing UX decisions, system engineering tradeoffs, and future product roadmap.
        </p>
      </div>

      <div className="judgment-grid">
        {/* Four UX Decisions */}
        <div className="judgment-section-card glass-panel span-two">
          <div className="section-header-row text-accent">
            <Compass size={20} />
            <h3 className="section-headline">1. Four Core UX Decisions</h3>
          </div>
          
          <div className="decisions-container">
            <div className="decision-item-full">
              <span className="decision-num">01</span>
              <div className="decision-content">
                <h4 className="decision-title">Contextualizing Confidence (Qualitative & Quantitative Mix)</h4>
                <p className="decision-text">
                  <strong>Decision:</strong> Instead of presenting raw dry statistics (e.g., "Confidence: 76%"), we pair the percentage with a descriptive human explanation (e.g., "Watch sensor was charging between 2 AM and 5 AM. Sleep duration is estimated using phone movement indicators").
                </p>
                <p className="decision-rational">
                  <strong>Rationale:</strong> In behavioral health, trust in data is paramount. If a user sees a low confidence score without context, they might assume the system is buggy. Explaining the <em>why</em> (sensor recharge gap, missing work agent) transforms a system limitation into a clear calibration step, building transparency.
                </p>
              </div>
            </div>

            <div className="decision-item-full">
              <span className="decision-num">02</span>
              <div className="decision-content">
                <h4 className="decision-title">The "Narrative Epoch" Timeline Paradigm</h4>
                <p className="decision-text">
                  <strong>Decision:</strong> Rather than forcing users to inspect noisy daily charts, the Chronis timeline is segmented into distinct behavioral epochs (e.g., "Baseline Audit", "The Caffeine Shift", "Digital Sunset").
                </p>
                <p className="decision-rational">
                  <strong>Rationale:</strong> Humans do not modify behaviors by inspecting raw scatterplots. We think in cycles. By organizing the timeline into "experiments," the interface models the scientific method: baseline, single-variable intervention, and multi-variable compound tracking. This reduces analysis paralysis.
                </p>
              </div>
            </div>

            <div className="decision-item-full">
              <span className="decision-num">03</span>
              <div className="decision-content">
                <h4 className="decision-title">Closing the Loop with Instant Protocol Triggers</h4>
                <p className="decision-text">
                  <strong>Decision:</strong> We placed high-contrast action buttons ("Start 90-Min Caffeine Delay Protocol") directly within the Insight Explorer. Activating it updates the app state, showing active status and micro-copy logs.
                </p>
                <p className="decision-rational">
                  <strong>Rationale:</strong> The friction between reading an insight and starting a habit is high. By embedding the "Commit" trigger directly inside the insight container, we reduce cognitive friction. The app immediately calibrates background trackers to verify compliance, bridging exploration and action.
                </p>
              </div>
            </div>

            <div className="decision-item-full">
              <span className="decision-num">04</span>
              <div className="decision-content">
                <h4 className="decision-title">The Onboarding Calibration Gate (Marketing to Product Bridge)</h4>
                <p className="decision-text">
                  <strong>Decision:</strong> We placed an interactive "Circadian Calibration Console" on the landing page, requiring users to initiate a biosensor telemetry sync before proceeding to the Dashboard.
                </p>
                <p className="decision-rational">
                  <strong>Rationale:</strong> Landing directly in data-heavy health consoles can feel dry. Tying the product release to a terminal calibration simulator creates an exciting narrative bridge, turning sensor linking into an interactive, gamified onboarding step.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tradeoff */}
        <div className="judgment-section-card glass-panel">
          <div className="section-header-row text-warning">
            <Scale size={20} />
            <h3 className="section-headline">2. The Primary Tradeoff</h3>
          </div>
          
          <div className="tradeoff-content">
            <h4 className="tradeoff-title">Data Completeness vs. Cognitive Friction</h4>
            <p className="tradeoff-text">
              We made a deliberate tradeoff to include detailed <strong>"Sensor Discrepancy & Missing Data"</strong> boxes within the UI rather than hiding it behind a generic "Syncing" state.
            </p>
            <p className="tradeoff-rational">
              <strong>The Tradeoff:</strong> Hiding missing data makes the interface look simpler and more polished. However, health and behavioral dashboards are prone to "sensor drift" (users forget watch, VPN blocks desktop logger). If we present clean data despite sensor drops, users notice inconsistencies (e.g., "I know I slept poorly, but Chronis says 90% quality").
            </p>
            <p className="tradeoff-rational">
              We traded off a minimalist, frictionless screen to deliver a transparent, calibrating UI. We decided that <strong>user trust in system telemetry</strong> was more valuable than a perfectly empty sidebar.
            </p>
          </div>
        </div>

        {/* Future Feature */}
        <div className="judgment-section-card glass-panel">
          <div className="section-header-row text-success">
            <Zap size={20} />
            <h3 className="section-headline">3. Next Prioritized Feature</h3>
          </div>
          
          <div className="feature-content">
            <h4 className="feature-title">Circadian Calibration Notifications & Sync Prompts</h4>
            <p className="feature-text">
              If Chronis launched tomorrow, the first feature we would prioritize is <strong>Passive Calibration Prompts</strong> linked to real-time sensor drop detection.
            </p>
            <p className="feature-impact">
              <strong>How it works:</strong> The system detects when a critical input stream (e.g., sleep accelerometer or dietary logging) is missing for more than 4 hours. It triggers a prompt at an optimal circadian hour (e.g., right before standard bedtime) with a custom action:
            </p>
            <ul className="feature-bullets">
              <li>
                <CheckCircle size={12} className="inline-icon text-success" />
                "Your watch battery is low (12%). Charge it now for 20m to track sleep."
              </li>
              <li>
                <CheckCircle size={12} className="inline-icon text-success" />
                "Skipped log: Did you drink coffee before 10 AM? Tap Yes / No."
              </li>
            </ul>
            <p className="feature-rational">
              <strong>Value:</strong> This preserves telemetry confidence and turns missing data from a passive error into an active, positive touchpoint.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
