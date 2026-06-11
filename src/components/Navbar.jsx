import React, { useState } from "react";
import { Activity, LayoutDashboard, BrainCircuit, CalendarClock, BookOpen, Gem, Volume2, VolumeX } from "lucide-react";
import { synth } from "../utils/audio";

export default function Navbar({ activeTab, setActiveTab, userProfile }) {
  const [isMuted, setIsMuted] = useState(synth.muted);

  const tabs = [
    { id: "locket", label: "The Locket", icon: Gem },
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "insights", label: "Insight Explorer", icon: BrainCircuit },
    { id: "timeline", label: "Narrative Timeline", icon: CalendarClock },
    { id: "rationale", label: "Product Rationale", icon: BookOpen }
  ];

  const handleToggleMute = () => {
    const newMuted = synth.toggleMute();
    setIsMuted(newMuted);
    if (!newMuted) {
      synth.play("chime");
    }
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    synth.play("click");
  };

  const handleHover = () => {
    synth.play("hoverTick");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div 
          className="nav-brand" 
          onClick={() => handleTabClick("locket")}
          onMouseEnter={handleHover}
        >
          <div className="logo-icon-wrapper">
            <Activity className="logo-icon animate-pulse-slow" />
          </div>
          <span className="brand-name">CHRONIS</span>
          <span className="brand-badge">PROTOTYPE</span>
        </div>

        <div className="nav-links">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                onMouseEnter={handleHover}
                className={`nav-tab-btn ${isActive ? "active" : ""}`}
                id={`nav-tab-${tab.id}`}
              >
                <Icon className="tab-icon" size={16} />
                <span className="tab-label">{tab.label}</span>
                {isActive && <span className="tab-active-indicator" />}
              </button>
            );
          })}
        </div>

        <div className="nav-profile">
          {/* Audio controller */}
          <button 
            className={`sound-toggle-btn ${isMuted ? "muted" : "active"}`}
            onClick={handleToggleMute}
            onMouseEnter={handleHover}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            {!isMuted && (
              <div className="sound-wave-bars">
                <span className="wave-bar bar1" />
                <span className="wave-bar bar2" />
                <span className="wave-bar bar3" />
              </div>
            )}
          </button>

          <div className="profile-details">
            <span className="profile-name">{userProfile.name}</span>
            <span className="profile-status">
              <span className="status-dot green" /> Synced
            </span>
          </div>
          <img src={userProfile.avatar} alt="User Avatar" className="profile-avatar" />
        </div>
      </div>
    </nav>
  );
}
