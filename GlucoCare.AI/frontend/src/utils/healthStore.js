const STORE = "healthdash_v2";

export function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getAllData() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) || {};
  } catch {
    return {};
  }
}

export function addEntry(value, time, dateKey = getTodayKey()) {
  const all = getAllData();
  if (!all[dateKey]) all[dateKey] = [];
  all[dateKey].push({ value: Number(value), time });
  localStorage.setItem(STORE, JSON.stringify(all));
  window.dispatchEvent(new Event("healthdash:update"));
}

export function deleteEntry(dateKey, index) {
  const all = getAllData();
  if (!all[dateKey]) return;
  all[dateKey].splice(index, 1);
  if (!all[dateKey].length) delete all[dateKey];
  localStorage.setItem(STORE, JSON.stringify(all));
  window.dispatchEvent(new Event("healthdash:update"));
}

export function getFlatValues() {
  return Object.values(getAllData())
    .flat()
    .map((x) => Number(x.value))
    .filter((v) => Number.isFinite(v));
}

export function getDailyTrend(limit = 14) {
  const all = getAllData();
  const keys = Object.keys(all).sort().slice(-limit);
  return keys.map((key) => {
    const vals = (all[key] || []).map((x) => Number(x.value)).filter((v) => Number.isFinite(v));
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    return { date: key.slice(5), avg };
  });
}

export function getRangeData() {
  const values = getFlatValues();
  let low = 0;
  let normal = 0;
  let high = 0;
  values.forEach((v) => {
    if (v < 70) low += 1;
    else if (v <= 140) normal += 1;
    else high += 1;
  });
  return [
    { name: "Low", value: low },
    { name: "Normal", value: normal },
    { name: "High", value: high },
  ];
}

export function getStats() {
  const values = getFlatValues();
  if (!values.length) {
    return { total: 0, avg: 0, min: 0, max: 0 };
  }
  return {
    total: values.length,
    avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
