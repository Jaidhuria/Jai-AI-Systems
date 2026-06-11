import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";

export default function OverviewPage() {
  const { data, selectedDate, viewYear, viewMonth, fmtKey, saveData } =
    useOutletContext();

  const [openFaq, setOpenFaq] = useState(null);

  const entries = data[selectedDate] || [];

  const monthPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-`;

  const monthVals = Object.entries(data)
    .filter(([k]) => k.startsWith(monthPrefix))
    .flatMap(([, v]) => v)
    .map((x) => Number(x.value))
    .filter((v) => Number.isFinite(v));

  const dayVals = entries.map((x) => Number(x.value)).filter(Number.isFinite);

  const dailyAvg = dayVals.length
    ? Math.round(dayVals.reduce((a, b) => a + b, 0) / dayVals.length)
    : "--";

  const monthAvg = monthVals.length
    ? Math.round(monthVals.reduce((a, b) => a + b, 0) / monthVals.length)
    : "--";

  const { lowPct, normalPct, highPct } = useMemo(() => {
    if (!monthVals.length)
      return { lowPct: 0, normalPct: 0, highPct: 100 };

    const low = monthVals.filter((v) => v < 70).length;
    const normal = monthVals.filter((v) => v >= 70 && v <= 140).length;
    const high = monthVals.filter((v) => v > 140).length;

    const total = monthVals.length;

    return {
      lowPct: (low / total) * 100,
      normalPct: (normal / total) * 100,
      highPct: (high / total) * 100,
    };
  }, [monthVals]);

  const chartData = useMemo(() => {
    const days = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result = [];

    for (let d = 1; d <= days; d++) {
      const key = fmtKey(viewYear, viewMonth, d);

      const vals = (data[key] || [])
        .map((e) => Number(e.value))
        .filter(Number.isFinite);

      if (vals.length) {
        result.push({
          day: d,
          avg: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
        });
      }
    }

    return result;
  }, [data, viewMonth, viewYear, fmtKey]);

  const glucoseStatus = (v) => {
    if (v < 70) return "low";
    if (v <= 140) return "normal";
    return "high";
  };

  const removeEntry = (index) => {
    const next = { ...data };
    next[selectedDate] = [...entries];
    next[selectedDate].splice(index, 1);

    if (!next[selectedDate].length) delete next[selectedDate];

    saveData(next);
  };

  const selectedDateLabel = new Date(selectedDate).toDateString();

  return (
    <section className="section">
      {/* KPI */}
      <div className="kpi-row">
        <KPI title="Daily Avg" value={dailyAvg} unit="mg/dL" type="blue" />
        <KPI title="Monthly Avg" value={monthAvg} unit="mg/dL" type="green" />
        <KPI
          title="Total Readings"
          value={monthVals.length}
          unit="this month"
          type="amber"
        />

        <div className="kpi">
          <div style={{ width: "100%" }}>
            <div className="kpi-label">Glucose Distribution</div>
            <div className="range-bar">
              <div className="range-low" style={{ width: `${lowPct}%` }} />
              <div className="range-normal" style={{ width: `${normalPct}%` }} />
              <div className="range-high" style={{ width: `${highPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="content-grid">
        {/* CHART */}
        <div className="card">
          <div className="card-header">
            <h2>Glucose Trend</h2>
          </div>

          <div className="chart-wrap">
            {chartData.length === 0 ? (
              <Empty text="No chart data" />
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData}>
                  
                  <defs>
                    <linearGradient id="gradient">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid stroke="#e9ecef" strokeDasharray="3 3" />

                  <XAxis dataKey="day" />
                  <YAxis />

                  <Tooltip />

                  {/* HEALTH RANGE */}
                  <ReferenceArea y1={70} y2={140} fill="#0d9488" fillOpacity={0.08} />

                  <Line
                    type="monotone"
                    dataKey="avg"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* DAILY INSIGHTS */}
        {/* <div className="card">
          <div className="card-header">
            <h2>Daily Insights</h2>
            <span className="tag">{selectedDateLabel}</span>
          </div>

          <div className="day-summary">
            <div>
              <span>Readings</span>
              <strong>{entries.length}</strong>
            </div>
            <div>
              <span>Average</span>
              <strong>{dailyAvg}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong className={`status-${glucoseStatus(dailyAvg)}`}>
                {glucoseStatus(dailyAvg)}
              </strong>
            </div>
          </div>

          <div className="entries-list">
            {!entries.length ? (
              <Empty text="No readings" />
            ) : (
              entries.map((e, i) => (
                <div key={i} className="entry-item enhanced">
                  <div>
                    <div>{e.time}</div>
                    <small>Glucose</small>
                  </div>

                  <div>
                    <span
                      className={`entry-value ${glucoseStatus(
                        Number(e.value)
                      )}`}
                    >
                      {e.value}
                    </span>

                    <button onClick={() => removeEntry(i)}>✕</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div> */}
      </div>

      {/* SMART HELP */}
      {/* <div className="card">
        <div className="card-header">
          <h2>Health Assistant</h2>
        </div> */}

        {/* <div className="help-container">
          {faqData.map((item, i) => (
            <div key={i} className="help-item">
              <div
                className="help-question"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                {item.q}
                <span>{openFaq === i ? "−" : "+"}</span>
              </div>

              <div
                className="help-answer"
                style={{ maxHeight: openFaq === i ? "120px" : "0px" }}
              >
                <p>{item.a}</p>
              </div>
            </div>
          ))}
        </div> */}
      {/* </div> */}
    </section>
  );
}

/* COMPONENTS */

const KPI = ({ title, value, unit, type }) => (
  <div className="kpi">
    <div className={`kpi-icon kpi-${type}`}></div>
    <div>
      <div className="kpi-label">{title}</div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-unit">{unit}</div>
    </div>
  </div>
);

const Empty = ({ text }) => (
  <div className="entries-empty">
    <p>{text}</p>
  </div>
);

/* FAQ */

const faqData = [
  {
    q: "What is normal glucose?",
    a: "70–99 mg/dL fasting is considered normal.",
  },
  {
    q: "What is high sugar?",
    a: "Above 140 mg/dL after meals may indicate high glucose.",
  },
  {
    q: "When is it dangerous?",
    a: "Above 300 mg/dL requires urgent medical attention.",
  },
];