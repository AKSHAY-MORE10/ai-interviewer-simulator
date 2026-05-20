import { useState } from "react";

// ─── Theme ────────────────────────────────────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#0f0f11",
    bgGrain: "rgba(255,255,255,0.015)",
    surface: "#17171b",
    surfaceAlt: "#1c1c22",
    surfaceHover: "#222228",
    border: "#27272f",
    borderLight: "#2e2e38",
    text: "#eeeef0",
    textSub: "#a0a0b0",
    textMuted: "#5a5a6e",
    textDim: "#2e2e3a",
    accent: "#c9a97a",           // warm gold
    accentHover: "#d8bc96",
    accentSoft: "rgba(201,169,122,0.10)",
    accentSofter: "rgba(201,169,122,0.05)",
    accentLine: "rgba(201,169,122,0.20)",
    green: "#6fcf97",
    greenSoft: "rgba(111,207,151,0.10)",
    red: "#eb8a8a",
    redSoft: "rgba(235,138,138,0.10)",
    amber: "#f0c070",
    amberSoft: "rgba(240,192,112,0.10)",
    blue: "#7eb8e8",
    blueSoft: "rgba(126,184,232,0.10)",
    shadow: "0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)",
    shadowSm: "0 1px 2px rgba(0,0,0,0.3)",
  },
  light: {
    bg: "#f7f5f2",
    bgGrain: "rgba(0,0,0,0.012)",
    surface: "#ffffff",
    surfaceAlt: "#f2f0ed",
    surfaceHover: "#eceae7",
    border: "#e4e0d8",
    borderLight: "#ede9e2",
    text: "#1a1916",
    textSub: "#5c5750",
    textMuted: "#9a9488",
    textDim: "#c8c2b8",
    accent: "#a07840",           // warm amber-brown
    accentHover: "#8a6432",
    accentSoft: "rgba(160,120,64,0.08)",
    accentSofter: "rgba(160,120,64,0.04)",
    accentLine: "rgba(160,120,64,0.18)",
    green: "#3a9e6e",
    greenSoft: "rgba(58,158,110,0.08)",
    red: "#c85050",
    redSoft: "rgba(200,80,80,0.08)",
    amber: "#b87820",
    amberSoft: "rgba(184,120,32,0.08)",
    blue: "#3878b8",
    blueSoft: "rgba(56,120,184,0.08)",
    shadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
    shadowSm: "0 1px 2px rgba(0,0,0,0.06)",
  },
};

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";
const API = API_BASE.endsWith("/api") ? API_BASE : `${API_BASE.replace(/\/$/, "")}/api`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const scoreColor = (score, t) => {
  if (score >= 80) return t.green;
  if (score >= 60) return t.amber;
  return t.red;
};
const difficultyColor = (d, t) => {
  if (d === "easy") return t.green;
  if (d === "medium") return t.amber;
  return t.red;
};

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = ({ t }) => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Jost:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { background: ${t.bg}; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes pulseRing {
      0%   { box-shadow: 0 0 0 0 ${t.accent}44; }
      70%  { box-shadow: 0 0 0 10px ${t.accent}00; }
      100% { box-shadow: 0 0 0 0 ${t.accent}00; }
    }
    .fade-up  { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) both; }
    .fade-up-d1 { animation-delay: 0.06s; }
    .fade-up-d2 { animation-delay: 0.12s; }
    .fade-up-d3 { animation-delay: 0.18s; }
    .fade-up-d4 { animation-delay: 0.24s; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 999px; }
    button, input, textarea { font-family: 'Jost', sans-serif; }
    button { transition: opacity 0.15s, transform 0.15s, background 0.15s; }
    button:hover:not(:disabled) { opacity: 0.88; }
    button:active:not(:disabled) { transform: scale(0.98); }
    input:focus, textarea:focus { outline: none; }
  `}</style>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner({ color }) {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14,
      border: `2px solid ${color}33`,
      borderTop: `2px solid ${color}`,
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
  );
}

// ─── Pill Badge ───────────────────────────────────────────────────────────────
function Pill({ children, color, bg, t }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 4,
      fontSize: 10, fontWeight: 600, letterSpacing: "0.08em",
      textTransform: "uppercase",
      fontFamily: "'Jost', sans-serif",
      color: color || t.accent,
      background: bg || t.accentSoft,
      border: `1px solid ${color || t.accent}30`,
    }}>{children}</span>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ children, t, style = {}, className = "" }) {
  return (
    <div className={className} style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
      padding: 24,
      boxShadow: t.shadowSm,
      ...style,
    }}>{children}</div>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────
function SectionLabel({ children, t }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
      textTransform: "uppercase", color: t.textMuted,
      fontFamily: "'Jost', sans-serif",
      marginBottom: 14,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      <span style={{ flex: 1, height: 1, background: t.border }} />
      {children}
      <span style={{ flex: 1, height: 1, background: t.border }} />
    </div>
  );
}

// ─── Score Ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, t, size = 96 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (clamp(score, 0, 100) / 100) * circ;
  const color = scoreColor(score, t);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={t.border} strokeWidth={5} />
        <circle cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{
          fontSize: size * 0.26, fontWeight: 700, color,
          fontFamily: "'Libre Baskerville', serif", lineHeight: 1,
        }}>{score}</span>
        <span style={{ fontSize: size * 0.1, color: t.textMuted, fontFamily: "'Jost', sans-serif", marginTop: 1 }}>/ 100</span>
      </div>
    </div>
  );
}

// ─── Metric Row ───────────────────────────────────────────────────────────────
function MetricRow({ label, value, color, t }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0",
      borderBottom: `1px solid ${t.border}`,
    }}>
      <span style={{ fontSize: 12, color: t.textMuted, fontWeight: 500, letterSpacing: "0.02em" }}>{label}</span>
      <span style={{
        fontSize: 12, fontWeight: 600, color: color || t.text,
        fontFamily: "'JetBrains Mono', monospace",
      }}>{value}</span>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, t }) {
  return (
    <div style={{
      background: t.surface,
      border: `1px solid ${t.border}`,
      borderRadius: 10, padding: "16px 18px",
      textAlign: "center", boxShadow: t.shadowSm,
    }}>
      <div style={{
        fontSize: 22, fontWeight: 700, color: color || t.text,
        fontFamily: "'Libre Baskerville', serif", lineHeight: 1.1,
        marginBottom: 6,
      }}>{value}</div>
      <div style={{
        fontSize: 10, color: t.textMuted, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.08em",
        fontFamily: "'Jost', sans-serif",
      }}>{label}</div>
    </div>
  );
}

// ─── Theme Toggle ─────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle, t }) {
  return (
    <button onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 6,
      background: "transparent",
      border: `1px solid ${t.border}`,
      borderRadius: 8, padding: "6px 12px",
      cursor: "pointer", color: t.textMuted,
      fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
      textTransform: "uppercase",
    }}>
      <span style={{ fontSize: 13 }}>{isDark ? "☀" : "◑"}</span>
      {isDark ? "Light" : "Dark"}
    </button>
  );
}

// ─── Tab Bar ─────────────────────────────────────────────────────────────────
function TabBar({ tabs, active, onChange, t }) {
  return (
    <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${t.border}` }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{
          padding: "8px 20px",
          border: "none", borderBottom: active === tab.id ? `2px solid ${t.accent}` : "2px solid transparent",
          background: "transparent",
          cursor: "pointer", fontSize: 12, fontWeight: 600,
          letterSpacing: "0.06em", textTransform: "uppercase",
          color: active === tab.id ? t.accent : t.textMuted,
          transition: "all 0.2s",
          marginBottom: -1,
        }}>{tab.label}</button>
      ))}
    </div>
  );
}

// ─── Code Editor ──────────────────────────────────────────────────────────────
function CodeEditor({ value, onChange, t }) {
  return (
    <div style={{
      border: `1px solid ${t.border}`,
      borderRadius: 10, overflow: "hidden",
      background: t.bg,
      boxShadow: t.shadowSm,
    }}>
      {/* Titlebar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 14px",
        background: t.surfaceAlt,
        borderBottom: `1px solid ${t.border}`,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {["#e07070", "#e0c060", "#70c070"].map((c, i) => (
            <div key={i} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
        </div>
        <span style={{
          fontSize: 11, color: t.textMuted,
          fontFamily: "'JetBrains Mono', monospace", marginLeft: 6,
        }}>solution.py</span>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        spellCheck={false}
        style={{
          width: "100%", minHeight: 260,
          background: "transparent",
          color: t.text,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12.5, lineHeight: 1.75,
          border: "none",
          padding: "16px 18px",
          resize: "vertical",
          caretColor: t.accent,
          display: "block",
        }}
        placeholder="# Write your solution here..."
      />
    </div>
  );
}

// ─── Btn Primary ──────────────────────────────────────────────────────────────
function BtnPrimary({ children, onClick, disabled, t, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "11px 28px", borderRadius: 8,
      background: disabled ? t.surfaceAlt : t.accent,
      color: disabled ? t.textMuted : "#fff",
      border: "none", cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 12, fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase",
      display: "inline-flex", alignItems: "center", gap: 8,
      boxShadow: disabled ? "none" : `0 2px 12px ${t.accent}30`,
      ...style,
    }}>{children}</button>
  );
}

// ─── Btn Ghost ────────────────────────────────────────────────────────────────
function BtnGhost({ children, onClick, disabled, color, borderColor, t, style = {} }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "11px 20px", borderRadius: 8,
      background: "transparent",
      color: disabled ? t.textMuted : (color || t.textSub),
      border: `1px solid ${disabled ? t.border : (borderColor || t.border)}`,
      cursor: disabled ? "not-allowed" : "pointer",
      fontSize: 12, fontWeight: 600, letterSpacing: "0.06em",
      textTransform: "uppercase",
      display: "inline-flex", alignItems: "center", gap: 8,
      ...style,
    }}>{children}</button>
  );
}

// ─── Interview View ───────────────────────────────────────────────────────────
function InterviewView({ t }) {
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [round, setRound] = useState(1);
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [hint, setHint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [topic, setTopic] = useState(null);
  const [subtopic, setSubtopic] = useState(null);

  async function startInterview() {
    setStarting(true);
    try {
      const res = await fetch(`${API}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setSessionId(data.session_id);
      setQuestion(data.question);
      setTopic(data.topic || null);
      setSubtopic(data.subtopic || null);
      setDifficulty(data.difficulty || "medium");
      setRound(data.round || 1);
      setCode("");
      setResult(null);
      setHint(null);
      setPhase("interview");
    } catch {
      alert("Could not connect to server. Make sure uvicorn is running.");
    }
    setStarting(false);
  }

  async function submitCode() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, code, language: "python" }),
      });
      const data = await res.json();
      setResult(data);
      setPhase("result");
    } catch {
      alert("Submission failed.");
    }
    setLoading(false);
  }

  async function getHint() {
    setHintLoading(true);
    try {
      const res = await fetch(`${API}/hint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      setHint(data.hint);
    } catch {
      alert("Could not get hint.");
    }
    setHintLoading(false);
  }

  async function nextQuestion() {
    if (!result?.next_question) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      setQuestion(data.question);
      setDifficulty(data.difficulty);
      setTopic(data.topic || null);
      setSubtopic(data.subtopic || null);
      setRound(data.round);
      setCode("");
      setResult(null);
      setHint(null);
      setPhase("interview");
    } catch {
      alert("Failed to load next question.");
    }
    setLoading(false);
  }

  // ── Idle ──
  if (phase === "idle") return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "64vh", textAlign: "center", gap: 40,
    }}>
      <div className="fade-up" style={{ maxWidth: 460 }}>
        {/* Icon mark */}
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: t.accentSoft,
          border: `1px solid ${t.accentLine}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, margin: "0 auto 28px",
          boxShadow: `0 4px 24px ${t.accent}18`,
        }}>⬡</div>

        <h2 style={{
          fontFamily: "'Libre Baskerville', serif",
          fontSize: 28, fontWeight: 700, color: t.text,
          letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.25,
        }}>
          Ready to be assessed?
        </h2>
        <p style={{
          color: t.textSub, fontSize: 14, lineHeight: 1.7,
          fontWeight: 400, maxWidth: 380, margin: "0 auto",
        }}>
          An adaptive AI interviewer evaluates your code quality,
          time complexity, and problem-solving approach in real time.
        </p>
      </div>

      <div className="fade-up fade-up-d2" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <BtnPrimary onClick={startInterview} disabled={starting} t={t} style={{ padding: "13px 40px", fontSize: 13 }}>
          {starting ? <Spinner color="#fff" /> : null}
          {starting ? "Starting…" : "Begin Interview"}
        </BtnPrimary>
        <span style={{ fontSize: 11, color: t.textMuted, letterSpacing: "0.04em" }}>
          Python · Adaptive difficulty · Real-time feedback
        </span>
      </div>

      {/* Decorative rule */}
      <div className="fade-up fade-up-d3" style={{ display: "flex", gap: 20, alignItems: "center", opacity: 0.5 }}>
        {["Code Quality", "Complexity", "Style", "Execution"].map((f, i) => (
          <span key={i} style={{
            fontSize: 10, color: t.textMuted, fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            fontFamily: "'Jost', sans-serif",
          }}>{f}{i < 3 && <span style={{ marginLeft: 20, color: t.border }}>·</span>}</span>
        ))}
      </div>
    </div>
  );

  // ── Interview ──
  if (phase === "interview") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Question card */}
      <Card t={t} className="fade-up">
        <div style={{ marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Pill color={difficultyColor(difficulty, t)} bg={`${difficultyColor(difficulty, t)}18`} t={t}>
            {difficulty}
          </Pill>
          <Pill t={t}>Round {round}</Pill>
          {topic && <Pill color={t.blue} bg={t.blueSoft} t={t}>{topic}</Pill>}
          {subtopic && <Pill color={t.textMuted} bg={t.surfaceAlt} t={t}>{subtopic}</Pill>}
        </div>
        <p style={{ fontSize: 15, color: t.text, lineHeight: 1.7, fontFamily: "'Libre Baskerville', serif" }}>
          {question}
        </p>
      </Card>

      {/* Session ID */}
      {sessionId && (
        <div className="fade-up fade-up-d1" style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "8px 14px",
          background: t.surfaceAlt, border: `1px solid ${t.border}`,
          borderRadius: 8, fontSize: 11,
        }}>
          <span style={{ color: t.textMuted, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>Session</span>
          <code style={{ color: t.accent, fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{sessionId}</code>
          <button onClick={() => navigator.clipboard.writeText(sessionId)} style={{
            marginLeft: "auto",
            background: t.accentSoft, border: `1px solid ${t.accentLine}`,
            color: t.accent, borderRadius: 5,
            padding: "2px 10px", cursor: "pointer",
            fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          }}>Copy</button>
        </div>
      )}

      {/* Hint */}
      {hint && (
        <div className="fade-up" style={{
          padding: "14px 18px", borderRadius: 10,
          background: t.amberSoft, border: `1px solid ${t.amber}28`,
          display: "flex", gap: 12, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 15, marginTop: 1 }}>💡</span>
          <p style={{ margin: 0, fontSize: 13, color: t.text, lineHeight: 1.65 }}>{hint}</p>
        </div>
      )}

      {/* Code editor */}
      <div className="fade-up fade-up-d1">
        <CodeEditor value={code} onChange={setCode} t={t} />
      </div>

      {/* Actions */}
      <div className="fade-up fade-up-d2" style={{ display: "flex", gap: 10 }}>
        <BtnGhost
          onClick={getHint} disabled={hintLoading}
          color={t.amber} borderColor={`${t.amber}40`} t={t}
        >
          {hintLoading ? <Spinner color={t.amber} /> : "💡"}
          {hintLoading ? "Fetching…" : "Request Hint"}
        </BtnGhost>

        <BtnPrimary
          onClick={submitCode} disabled={loading || !code.trim()}
          t={t} style={{ flex: 1, justifyContent: "center" }}
        >
          {loading ? <Spinner color="#fff" /> : null}
          {loading ? "Evaluating…" : "Submit Solution"}
        </BtnPrimary>
      </div>
    </div>
  );

  // ── Result ──
  if (phase === "result" && result) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* Score banner */}
      <Card t={t} className="fade-up" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <ScoreRing score={result.score} t={t} size={100} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 7, marginBottom: 11, flexWrap: "wrap" }}>
              <Pill color={scoreColor(result.score, t)} bg={`${scoreColor(result.score, t)}18`} t={t}>
                {result.report?.performance?.performance_label || "Evaluated"}
              </Pill>
              <Pill color={t.blue} bg={t.blueSoft} t={t}>
                {result.report?.verdict?.hire_recommendation || "—"}
              </Pill>
              <Pill color={difficultyColor(difficulty, t)} bg={`${difficultyColor(difficulty, t)}18`} t={t}>
                {difficulty}
              </Pill>
            </div>
            <p style={{ margin: "0 0 10px", fontSize: 14, color: t.text, lineHeight: 1.65 }}>
              {result.feedback}
            </p>
            {result.followup && (
              <p style={{
                margin: 0, fontSize: 13, color: t.accent,
                fontStyle: "italic", lineHeight: 1.5,
                borderLeft: `2px solid ${t.accentLine}`,
                paddingLeft: 12,
              }}>
                {result.followup}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Complexity + Quality */}
      <div className="fade-up fade-up-d1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card t={t} style={{ padding: 18 }}>
          <SectionLabel t={t}>Complexity</SectionLabel>
          <MetricRow label="Time" value={result.complexity?.time_complexity} color={t.accent} t={t} />
          <MetricRow label="Space" value={result.complexity?.space_complexity} color={t.blue} t={t} />
          <MetricRow label="Nested Loops" value={result.complexity?.nested_loops ?? "—"} t={t} />
          <MetricRow label="Recursion" value={result.complexity?.recursion ? "Yes" : "No"} t={t} />
          {result.complexity?.reasoning && (
            <p style={{ margin: "10px 0 0", fontSize: 11.5, color: t.textMuted, lineHeight: 1.6 }}>
              {result.complexity.reasoning}
            </p>
          )}
        </Card>

        <Card t={t} style={{ padding: 18 }}>
          <SectionLabel t={t}>Code Quality</SectionLabel>
          <MetricRow label="Quality Score" value={`${result.quality?.quality_score}/100`}
            color={scoreColor(result.quality?.quality_score || 0, t)} t={t} />
          <MetricRow label="PEP 8 Violations" value={result.quality?.pep8_violations ?? 0} t={t} />
          <MetricRow label="Has Docstrings" value={result.quality?.has_docstrings ? "✓ Yes" : "✗ No"} t={t} />
          {result.quality?.issues?.length > 0 && (
            <div style={{ marginTop: 10 }}>
              {result.quality.issues.slice(0, 3).map((iss, i) => (
                <div key={i} style={{
                  fontSize: 11, color: t.amber, padding: "3px 0",
                  display: "flex", gap: 6, alignItems: "flex-start",
                }}>
                  <span>⚠</span><span>{iss}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Execution */}
      <Card t={t} className="fade-up fade-up-d2" style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <SectionLabel t={t}>Execution</SectionLabel>
          <Pill
            color={result.run?.success ? t.green : t.red}
            bg={result.run?.success ? t.greenSoft : t.redSoft}
            t={t}
          >{result.run?.success ? "Passed" : "Failed"}</Pill>
        </div>
        {result.run?.output && (
          <pre style={{
            margin: 0, padding: "12px 14px",
            background: t.bg, borderRadius: 8,
            fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
            color: t.green, border: `1px solid ${t.border}`,
            whiteSpace: "pre-wrap", wordBreak: "break-all",
          }}>{result.run.output}</pre>
        )}
        {result.run?.error && (
          <pre style={{
            margin: "8px 0 0", padding: "12px 14px",
            background: t.redSoft, borderRadius: 8,
            fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
            color: t.red, border: `1px solid ${t.red}20`,
            whiteSpace: "pre-wrap", wordBreak: "break-all",
          }}>{result.run.error}</pre>
        )}
      </Card>

      {/* Strengths & Improvements */}
      <div className="fade-up fade-up-d3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card t={t} style={{ padding: 18 }}>
          <SectionLabel t={t}>Strengths</SectionLabel>
          {result.report?.verdict?.strengths?.map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: 8, padding: "5px 0",
              fontSize: 13, color: t.text, alignItems: "flex-start",
            }}>
              <span style={{ color: t.green, flexShrink: 0, marginTop: 1 }}>↗</span>
              <span style={{ lineHeight: 1.55 }}>{s}</span>
            </div>
          ))}
        </Card>
        <Card t={t} style={{ padding: 18 }}>
          <SectionLabel t={t}>Improvements</SectionLabel>
          {result.report?.verdict?.improvements?.map((s, i) => (
            <div key={i} style={{
              display: "flex", gap: 8, padding: "5px 0",
              fontSize: 13, color: t.text, alignItems: "flex-start",
            }}>
              <span style={{ color: t.amber, flexShrink: 0, marginTop: 1 }}>↑</span>
              <span style={{ lineHeight: 1.55 }}>{s}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Next question */}
      {result.next_question && (
        <div className="fade-up fade-up-d4" style={{
          padding: "18px 20px", borderRadius: 10,
          background: t.accentSofter, border: `1px solid ${t.accentLine}`,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 10, color: t.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {result.next_question.message}
            </p>
            <p style={{ margin: 0, fontSize: 14, color: t.text, lineHeight: 1.55 }}>{result.next_question.question}</p>
          </div>
          <BtnPrimary onClick={nextQuestion} t={t} style={{ flexShrink: 0 }}>
            Next →
          </BtnPrimary>
        </div>
      )}
    </div>
  );

  return null;
}

// ─── Dashboard View ───────────────────────────────────────────────────────────
function DashboardView({ t }) {
  const [sessionId, setSessionId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchReport() {
    if (!sessionId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/report/${sessionId.trim()}`);
      const data = await res.json();
      if (data.error) { setError(data.error); setReport(null); }
      else setReport(data.report || data);
    } catch {
      setError("Failed to fetch report.");
    }
    setLoading(false);
  }

  const r = report;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Search */}
      <Card t={t} className="fade-up" style={{ padding: 20 }}>
        <p style={{
          fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: t.textMuted,
          marginBottom: 12, fontFamily: "'Jost', sans-serif",
        }}>Load Candidate Report</p>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchReport()}
            placeholder="Enter session ID…"
            style={{
              flex: 1, padding: "10px 14px",
              background: t.bg, border: `1px solid ${t.border}`,
              borderRadius: 8, color: t.text,
              fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
              transition: "border-color 0.2s",
            }}
            onFocus={e => e.target.style.borderColor = t.accent}
            onBlur={e => e.target.style.borderColor = t.border}
          />
          <BtnPrimary onClick={fetchReport} disabled={loading || !sessionId.trim()} t={t}>
            {loading ? <Spinner color="#fff" /> : null}
            {loading ? "Loading…" : "Load"}
          </BtnPrimary>
        </div>
        {error && <p style={{ margin: "10px 0 0", fontSize: 12, color: t.red }}>{error}</p>}
      </Card>

      {!r && !loading && (
        <div className="fade-up fade-up-d1" style={{ textAlign: "center", padding: "52px 0", color: t.textMuted }}>
          <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.6 }}>◫</div>
          <p style={{ margin: 0, fontSize: 13, letterSpacing: "0.02em" }}>Enter a session ID to load a candidate report</p>
        </div>
      )}

      {r && (
        <>
          {/* Verdict banner */}
          <Card t={t} className="fade-up" style={{
            background: t.accentSofter,
            border: `1px solid ${t.accentLine}`,
            padding: 22,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
              <ScoreRing score={r.performance?.final_score || 0} t={t} size={96} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", gap: 7, marginBottom: 12, flexWrap: "wrap" }}>
                  <Pill color={t.blue} bg={t.blueSoft} t={t}>{r.verdict?.hire_recommendation}</Pill>
                  <Pill color={scoreColor(r.performance?.final_score || 0, t)}
                    bg={`${scoreColor(r.performance?.final_score || 0, t)}18`} t={t}>
                    {r.performance?.performance_label}
                  </Pill>
                  <Pill color={difficultyColor(r.meta?.difficulty, t)}
                    bg={`${difficultyColor(r.meta?.difficulty, t)}18`} t={t}>
                    {r.meta?.difficulty}
                  </Pill>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 14, color: t.text, lineHeight: 1.65 }}>
                  {r.verdict?.summary}
                </p>
                <p style={{ margin: 0, fontSize: 11, color: t.textMuted, fontFamily: "'JetBrains Mono', monospace" }}>
                  {r.meta?.session_id} · {new Date(r.meta?.generated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Metrics grid */}
          <div className="fade-up fade-up-d1" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {[
              { label: "Final Score", value: `${r.performance?.final_score}/100`, color: scoreColor(r.performance?.final_score || 0, t) },
              { label: "Adjusted Score", value: `${r.performance?.adjusted_score}/100`, color: t.accent },
              { label: "Hints Used", value: r.performance?.hints_used ?? 0, color: r.performance?.hints_used > 2 ? t.red : t.green },
              { label: "Rounds", value: r.meta?.rounds ?? 1, color: t.blue },
            ].map((m, i) => (
              <StatCard key={i} {...m} t={t} />
            ))}
          </div>

          {/* Complexity + Quality */}
          <div className="fade-up fade-up-d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card t={t} style={{ padding: 18 }}>
              <SectionLabel t={t}>Complexity</SectionLabel>
              <MetricRow label="Time" value={r.code_analysis?.complexity?.time} color={t.accent} t={t} />
              <MetricRow label="Space" value={r.code_analysis?.complexity?.space} color={t.blue} t={t} />
              {r.code_analysis?.complexity?.reasoning && (
                <p style={{ margin: "10px 0 0", fontSize: 11.5, color: t.textMuted, lineHeight: 1.6 }}>
                  {r.code_analysis.complexity.reasoning}
                </p>
              )}
            </Card>
            <Card t={t} style={{ padding: 18 }}>
              <SectionLabel t={t}>Code Quality</SectionLabel>
              <MetricRow label="Quality Score" value={`${r.code_analysis?.quality?.score}/100`}
                color={scoreColor(r.code_analysis?.quality?.score || 0, t)} t={t} />
              <MetricRow label="PEP 8 Violations" value={r.code_analysis?.quality?.pep8_violations ?? 0} t={t} />
              <MetricRow label="Docstrings" value={r.code_analysis?.quality?.has_docstrings ? "✓ Yes" : "✗ No"} t={t} />
            </Card>
          </div>

          {/* Strengths & Improvements */}
          <div className="fade-up fade-up-d3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <Card t={t} style={{ padding: 18 }}>
              <SectionLabel t={t}>Strengths</SectionLabel>
              {r.verdict?.strengths?.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", fontSize: 13, color: t.text }}>
                  <span style={{ color: t.green }}>↗</span><span style={{ lineHeight: 1.55 }}>{s}</span>
                </div>
              ))}
            </Card>
            <Card t={t} style={{ padding: 18 }}>
              <SectionLabel t={t}>Improvements</SectionLabel>
              {r.verdict?.improvements?.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", fontSize: 13, color: t.text }}>
                  <span style={{ color: t.amber }}>↑</span><span style={{ lineHeight: 1.55 }}>{s}</span>
                </div>
              ))}
            </Card>
          </div>

          {/* Interviewer Notes */}
          <Card t={t} className="fade-up fade-up-d4" style={{ padding: 18 }}>
            <SectionLabel t={t}>Interviewer Notes</SectionLabel>
            <p style={{ margin: "0 0 12px", fontSize: 14, color: t.text, lineHeight: 1.65 }}>
              {r.interviewer_notes?.feedback}
            </p>
            {r.interviewer_notes?.followup_question && (
              <p style={{
                margin: 0, fontSize: 13, color: t.accent,
                fontStyle: "italic", lineHeight: 1.5,
                borderLeft: `2px solid ${t.accentLine}`, paddingLeft: 12,
              }}>
                {r.interviewer_notes.followup_question}
              </p>
            )}
          </Card>

          {/* Code Submitted */}
          <Card t={t} className="fade-up fade-up-d4" style={{ padding: 18 }}>
            <SectionLabel t={t}>Code Submitted</SectionLabel>
            <pre style={{
              margin: 0, padding: "14px 16px",
              background: t.bg, borderRadius: 8,
              fontSize: 11.5, fontFamily: "'JetBrains Mono', monospace",
              color: t.text, border: `1px solid ${t.border}`,
              whiteSpace: "pre-wrap", overflowX: "auto",
            }}>{r.problem?.code_submitted}</pre>
          </Card>
        </>
      )}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [tab, setTab] = useState("interview");
  const t = THEMES[isDark ? "dark" : "light"];

  return (
    <div style={{
      minHeight: "100vh",
      background: t.bg,
      color: t.text,
      fontFamily: "'Jost', 'Segoe UI', sans-serif",
      transition: "background 0.3s, color 0.3s",
    }}>
      <GlobalStyles key={isDark ? "dark" : "light"} t={t} />

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: `${t.surface}f0`,
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${t.border}`,
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 7,
            background: t.accentSoft, border: `1px solid ${t.accentLine}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, color: t.accent,
          }}>⬡</div>
          <span style={{
            fontFamily: "'Libre Baskerville', serif",
            fontSize: 16, fontWeight: 700, color: t.text,
            letterSpacing: "-0.02em",
          }}>EvalonAI</span>
          <span style={{
            fontSize: 9, fontWeight: 700, color: t.accent,
            background: t.accentSoft, padding: "2px 7px",
            borderRadius: 4, letterSpacing: "0.08em",
            textTransform: "uppercase", fontFamily: "'Jost', sans-serif",
            border: `1px solid ${t.accentLine}`,
          }}>Beta</span>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <TabBar
            tabs={[
              { id: "interview", label: "Interview" },
              { id: "dashboard", label: "Dashboard" },
            ]}
            active={tab}
            onChange={setTab}
            t={t}
          />
          <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} t={t} />
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "36px 24px 80px" }}>
        {tab === "interview" ? <InterviewView t={t} /> : <DashboardView t={t} />}
      </main>
    </div>
  );
}