import React, { useState } from "react";
import Navbar from "./components/Navbar";
import LocketLanding from "./components/LocketLanding";
import Dashboard from "./components/Dashboard";
import InsightExplorer from "./components/InsightExplorer";
import NarrativeTimeline from "./components/NarrativeTimeline";
import ProductJudgment from "./components/ProductJudgment";
import { mockData } from "./data/mockData";

export default function App() {
  const [activeTab, setActiveTab] = useState("locket");
  const [selectedInsightId, setSelectedInsightId] = useState("insight-caffeine");
  const [selectedMetricId, setSelectedMetricId] = useState(null);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "locket":
        return <LocketLanding onUnlockDashboard={() => setActiveTab("dashboard")} />;
      case "dashboard":
        return (
          <Dashboard
            metrics={mockData.metrics}
            recentChanges={mockData.recentChanges}
            confidenceIndicators={mockData.confidenceIndicators}
            onSelectMetric={setSelectedMetricId}
            onSelectInsight={setSelectedInsightId}
          />
        );
      case "insights":
        return (
          <InsightExplorer
            insights={mockData.insights}
            selectedInsightId={selectedInsightId}
            setSelectedInsightId={setSelectedInsightId}
          />
        );
      case "timeline":
        return <NarrativeTimeline timelineEpochs={mockData.timelineEpochs} />;
      case "rationale":
        return <ProductJudgment />;
      default:
        return (
          <div className="text-center py-20">
            <h3>Section Not Found</h3>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        userProfile={mockData.userProfile}
      />

      {/* Main Body */}
      <main className="main-content">
        {renderActiveTab()}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>© {new Date().getFullYear()} Chronis Technologies Inc. All rights reserved.</p>
          <p style={{ marginTop: "4px" }}>
            Recreated from <a href="https://www.chronis.in" target="_blank" rel="noreferrer" className="text-accent" style={{ textDecoration: "none" }}>chronis.in</a> for the Product & App Engineer Hiring Assessment.
          </p>
        </div>
      </footer>
    </div>
  );
}
