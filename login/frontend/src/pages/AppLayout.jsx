import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./app-layout.css";

const STORE = "healthdash_v2";

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || {};
  } catch {
    return {};
  }
}

function fmtKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const [data, setData] = useState(loadData());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(
    fmtKey(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const links = [
    { to: "/app/overview", label: "Overview" },
    { to: "/app/log", label: "Log Entry" },
    { to: "/app/risk", label: "Risk Check" },
    { to: "/app/chat", label: "Ask AI" },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const saveData = (nextData) => {
    setData(nextData);
    localStorage.setItem(STORE, JSON.stringify(nextData));
    window.dispatchEvent(new Event("healthdash:update"));
  };

  const getInitials = () => {
    const nameOrEmail = user?.displayName || user?.email || "U";
    return nameOrEmail
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("");
  };

  const pageTitleMap = {
    "/app/overview": "Overview",
    "/app/log": "Log Entry",
    "/app/risk": "Risk Check",
    "/app/chat": "Ask AI",
  };

  const pageDate = today.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const onPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
      return;
    }
    setViewMonth((m) => m - 1);
  };

  const onNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
      return;
    }
    setViewMonth((m) => m + 1);
  };

  return (
    <>
      <div className="ambient">
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className="layout">
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-mark">H</div>
            <span className="brand-name">HealthDash</span>
            <div className="demo-badge">LIVE</div>
          </div>
          <nav className="nav">
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-item ${location.pathname === item.to ? "active" : ""}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="sidebar-section">
            <div className="section-label">CALENDAR</div>
            <div className="calendar" id="calendarCard">
              <div className="cal-header">
                <button className="cal-btn" onClick={onPrevMonth}>
                  {"<"}
                </button>
                <span className="cal-month">{monthLabel}</span>
                <button className="cal-btn" onClick={onNextMonth}>
                  {">"}
                </button>
              </div>
              <div className="weekdays">
                <div>S</div>
                <div>M</div>
                <div>T</div>
                <div>W</div>
                <div>T</div>
                <div>F</div>
                <div>S</div>
              </div>
              <div className="days">
                {Array.from({ length: firstDay }).map((_, idx) => (
                  <div key={`blank-${idx}`}></div>
                ))}
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const day = idx + 1;
                  const key = fmtKey(viewYear, viewMonth, day);
                  const todayKey = fmtKey(today.getFullYear(), today.getMonth(), today.getDate());
                  const hasData = (data[key] || []).length > 0;
                  return (
                    <button
                      key={key}
                      className={`day ${key === todayKey ? "today" : ""} ${
                        key === selectedDate ? "selected" : ""
                      } ${hasData ? "has-data" : ""}`}
                      onClick={() => setSelectedDate(key)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="avatar">{getInitials()}</div>
              <div>
                <div className="user-name">{user?.displayName || "User"}</div>
                <div className="user-sub">Patient</div>
              </div>
            </div>
            <button className="icon-btn" title="Logout" onClick={handleLogout}>
              ⎋
            </button>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <div className="topbar-left">
              <h1 className="page-title">{pageTitleMap[location.pathname] || "Overview"}</h1>
              <span className="page-sub">{pageDate}</span>
            </div>
            <div className="topbar-right">
              <div className="status-dot"></div>
              <span className="status-text">Local sync active</span>
            </div>
          </header>

          <Outlet
            context={{
              data,
              saveData,
              selectedDate,
              setSelectedDate,
              viewYear,
              viewMonth,
              today,
              fmtKey,
            }}
          />
        </main>
      </div>
    </>
  );
}

export default AppLayout;
