import { useState, useEffect } from "react";

const SPORTS = [
  { id: "gym", label: "Gym", emoji: "🏋️" },
  { id: "jogging", label: "Jogging", emoji: "🏃" },
  { id: "soccer", label: "Soccer", emoji: "⚽" },
  { id: "tennis", label: "Tennis", emoji: "🎾" },
  { id: "pickle_table", label: "Table Tennis /\nPickleball", emoji: "🏓" },
  { id: "other", label: "Other", emoji: "🤸" },
];

const STORAGE_KEY = "sport-tracker-records";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persistRecords(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function App() {
  const [records, setRecords] = useState(() => loadRecords());
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [view, setView] = useState("log");
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [calMonth, setCalMonth] = useState(() => {
    const t = new Date();
    return { year: t.getFullYear(), month: t.getMonth() };
  });

  useEffect(() => {
    setNote(records[selectedDate]?.note || "");
    setSaved(false);
  }, [selectedDate, records]);

  function saveRecords(updated) {
    setRecords(updated);
    persistRecords(updated);
  }

  function toggleSport(sportId) {
    const dayData = records[selectedDate] || { sports: [], note: "" };
    const sports = dayData.sports.includes(sportId)
      ? dayData.sports.filter((s) => s !== sportId)
      : [...dayData.sports, sportId];
    saveRecords({ ...records, [selectedDate]: { ...dayData, sports } });
    setSaved(false);
  }

  function saveNote() {
    const dayData = records[selectedDate] || { sports: [], note: "" };
    saveRecords({ ...records, [selectedDate]: { ...dayData, note } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const todaySports = records[selectedDate]?.sports || [];

  const allDates = Object.keys(records).filter((d) => (records[d].sports?.length || 0) > 0);
  const totalDays = allDates.length;
  const sportCounts = {};
  SPORTS.forEach((s) => (sportCounts[s.id] = 0));
  Object.values(records).forEach((day) => {
    (day.sports || []).forEach((s) => { if (sportCounts[s] !== undefined) sportCounts[s]++; });
  });
  const topSport = SPORTS.reduce((a, b) => (sportCounts[a.id] || 0) >= (sportCounts[b.id] || 0) ? a : b);

  function getCalDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }

  const calCells = getCalDays(calMonth.year, calMonth.month);

  function prevMonth() {
    setCalMonth(({ year, month }) => month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 });
  }
  function nextMonth() {
    setCalMonth(({ year, month }) => month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 });
  }

  function calDateStr(day) {
    return `${calMonth.year}-${String(calMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function dateSportEmojis(dateStr) {
    const sports = records[dateStr]?.sports || [];
    return sports.slice(0, 4).map((sid) => SPORTS.find((s) => s.id === sid)?.emoji || "").join("");
  }

  const TABS = [
    { id: "log", label: "Log" },
    { id: "calendar", label: "Calendar" },
    { id: "history", label: "History" },
  ];

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif", background: "#0f1117", minHeight: "100vh", color: "#f0f0f0", paddingBottom: 40 }}>
      <div style={{ background: "linear-gradient(135deg, #1a1f2e 0%, #0f1117 100%)", borderBottom: "1px solid #1e2535", padding: "20px 20px 0" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
            <span style={{ fontSize: 22 }}>🏅</span>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: "0.04em", color: "#e8eaf0" }}>Sport Tracker</h1>
          </div>
          <p style={{ fontSize: 12, color: "#5a6070", margin: "0 0 16px" }}>Track your daily activity</p>
          <div style={{ display: "flex" }}>
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setView(tab.id)} style={{
                flex: 1, padding: "10px 0", border: "none", background: "transparent", cursor: "pointer",
                color: view === tab.id ? "#7c9ef8" : "#5a6070",
                borderBottom: view === tab.id ? "2px solid #7c9ef8" : "2px solid transparent",
                fontSize: 13, fontWeight: view === tab.id ? 600 : 400, transition: "all 0.2s",
              }}>{tab.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 16px" }}>

        {view === "log" && (
          <>
            <div style={{ marginTop: 20, marginBottom: 6 }}>
              <p style={{ fontSize: 13, color: "#a0b0c8", fontWeight: 600, margin: "0 0 4px" }}>{formatDate(selectedDate)}{selectedDate === todayStr() ? " — Today" : ""}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "#5a6070", marginBottom: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Today's Activity</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SPORTS.map((sport) => {
                  const active = todaySports.includes(sport.id);
                  return (
                    <button key={sport.id} onClick={() => toggleSport(sport.id)} style={{
                      padding: "14px 12px", borderRadius: 14,
                      border: active ? "2px solid #7c9ef8" : "2px solid #1e2535",
                      background: active ? "linear-gradient(135deg, #1e2c50, #1a2340)" : "#161b26",
                      cursor: "pointer", textAlign: "left", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 10,
                      transform: active ? "scale(1.02)" : "scale(1)",
                    }}>
                      <span style={{ fontSize: 24 }}>{sport.emoji}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: active ? "#a8c0ff" : "#c0c8d8", lineHeight: 1.3, whiteSpace: "pre-line" }}>{sport.label}</div>
                        {active && <div style={{ fontSize: 10, color: "#7c9ef8", marginTop: 2 }}>✓ Logged</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "#5a6070", marginBottom: 8, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Notes</p>
              <textarea value={note} onChange={(e) => { setNote(e.target.value); setSaved(false); }}
                placeholder="How did it go today?"
                style={{ width: "100%", minHeight: 76, padding: "12px", boxSizing: "border-box",
                  background: "#161b26", border: "1px solid #1e2535", borderRadius: 12,
                  color: "#d0d8e8", fontSize: 14, resize: "vertical", outline: "none", fontFamily: "inherit" }} />
              <button onClick={saveNote} style={{
                marginTop: 8, padding: "10px 20px", borderRadius: 10,
                background: saved ? "#1e4030" : "#7c9ef8",
                color: saved ? "#5de8a0" : "#fff",
                border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, transition: "all 0.2s",
              }}>{saved ? "✓ Saved" : "Save Note"}</button>
            </div>
            <div style={{ background: "#161b26", borderRadius: 16, padding: "16px", display: "flex", gap: 16 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#7c9ef8" }}>{totalDays}</div>
                <div style={{ fontSize: 11, color: "#5a6070" }}>Active Days</div>
              </div>
              <div style={{ width: 1, background: "#1e2535" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#a8c0ff" }}>{totalDays > 0 ? topSport.emoji : "—"}</div>
                <div style={{ fontSize: 11, color: "#5a6070" }}>{totalDays > 0 ? topSport.label.split("\n")[0] : "No data"}</div>
              </div>
              <div style={{ width: 1, background: "#1e2535" }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#7c9ef8" }}>{todaySports.length}</div>
                <div style={{ fontSize: 11, color: "#5a6070" }}>Today</div>
              </div>
            </div>
          </>
        )}

        {view === "calendar" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <button onClick={prevMonth} style={{ background: "#161b26", border: "1px solid #1e2535", color: "#a0b0c8", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 16 }}>‹</button>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#e0e8f8" }}>{MONTHS[calMonth.month]} {calMonth.year}</span>
              <button onClick={nextMonth} style={{ background: "#161b26", border: "1px solid #1e2535", color: "#a0b0c8", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontSize: 16 }}>›</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginBottom: 4 }}>
              {DAYS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, color: "#5a6070", fontWeight: 600, padding: "4px 0", letterSpacing: "0.05em" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
              {calCells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;
                const ds = calDateStr(day);
                const isToday = ds === todayStr();
                const isSelected = ds === selectedDate;
                const hasSports = (records[ds]?.sports?.length || 0) > 0;
                const emojis = dateSportEmojis(ds);
                return (
                  <button key={ds} onClick={() => { setSelectedDate(ds); setView("log"); }}
                    style={{
                      padding: "6px 2px", borderRadius: 10, border: "none", cursor: "pointer",
                      background: isSelected ? "#7c9ef8" : isToday ? "#1e2c50" : hasSports ? "#161e30" : "#161b26",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                      outline: isToday && !isSelected ? "1px solid #3a5080" : "none",
                      minHeight: 52,
                    }}>
                    <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 400, color: isSelected ? "#fff" : isToday ? "#a8c0ff" : hasSports ? "#c0d0f0" : "#5a6070" }}>{day}</span>
                    {emojis && <span style={{ fontSize: 11, lineHeight: 1.2 }}>{emojis}</span>}
                    {hasSports && !emojis && (
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.8)" : "#7c9ef8" }} />
                    )}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 16, background: "#161b26", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ fontSize: 11, color: "#5a6070", margin: "0 0 8px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Tap a day to log or edit</p>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {[["#7c9ef8","Selected"],["#161e30, border: 1px solid #3a5080","Today"],["#161e30","Has activity"]].map(([bg, label]) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: bg.split(",")[0] }} />
                    <span style={{ fontSize: 11, color: "#8090a8" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "history" && (
          <div style={{ marginTop: 20 }}>
            <div style={{ background: "#161b26", borderRadius: 16, padding: "16px", marginBottom: 20 }}>
              <p style={{ fontSize: 11, color: "#5a6070", margin: "0 0 14px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sport Breakdown</p>
              {SPORTS.map((sport) => {
                const count = sportCounts[sport.id] || 0;
                const max = Math.max(...SPORTS.map((s) => sportCounts[s.id] || 0), 1);
                return (
                  <div key={sport.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 16, width: 22 }}>{sport.emoji}</span>
                    <span style={{ fontSize: 12, color: "#c0c8d8", width: 130, whiteSpace: "pre-line", lineHeight: 1.3 }}>{sport.label}</span>
                    <div style={{ flex: 1, height: 7, background: "#1e2535", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 4, background: "linear-gradient(90deg, #4c6ef5, #7c9ef8)", width: `${(count / max) * 100}%`, transition: "width 0.4s ease" }} />
                    </div>
                    <span style={{ fontSize: 13, color: "#7c9ef8", fontWeight: 700, width: 22, textAlign: "right" }}>{count}</span>
                  </div>
                );
              })}
            </div>
            {allDates.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#5a6070" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🏅</div>
                <p style={{ fontSize: 14 }}>No records yet</p>
                <p style={{ fontSize: 12 }}>Log your first activity in the Log tab</p>
              </div>
            ) : (
              [...allDates].sort((a, b) => b.localeCompare(a)).map((date) => {
                const day = records[date];
                return (
                  <div key={date} style={{ background: "#161b26", borderRadius: 14, padding: "14px 16px", marginBottom: 10, cursor: "pointer" }}
                    onClick={() => { setSelectedDate(date); setView("log"); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#a0b0c8", fontWeight: 600 }}>{formatDate(date)}{date === todayStr() ? " — Today" : ""}</span>
                      <span style={{ fontSize: 11, color: "#5a6070" }}>→</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(day.sports || []).map((sid) => {
                        const sp = SPORTS.find((s) => s.id === sid);
                        return sp ? (
                          <span key={sid} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#1e2c50", color: "#a8c0ff", display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "pre-line" }}>
                            {sp.emoji} {sp.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                    {day.note && <p style={{ fontSize: 12, color: "#5a6070", margin: "8px 0 0", lineHeight: 1.4 }}>💬 {day.note}</p>}
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
}
