import { useState, useRef, useEffect } from "react";

// ─── Inline styles (no Tailwind needed — works in any injected context) ────────
const styles = {
  // Floating trigger button
  trigger: {
    position: "fixed",
    bottom: "28px",
    right: "28px",
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    border: "1.5px solid rgba(99,179,237,0.35)",
    boxShadow: "0 4px 24px rgba(0,0,0,0.45), 0 0 0 0 rgba(99,179,237,0.4)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    animation: "aca-pulse 2.8s ease-in-out infinite",
  },
  triggerIcon: { width: "22px", height: "22px", fill: "#63b3ed" },

  // Main panel
  panel: {
    position: "fixed",
    bottom: "90px",
    right: "28px",
    width: "360px",
    maxHeight: "520px",
    background: "#0d1117",
    border: "1px solid rgba(99,179,237,0.18)",
    borderRadius: "16px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
    fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
    zIndex: 999998,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "opacity 0.2s ease, transform 0.2s ease",
  },

  // Header
  header: {
    padding: "14px 18px",
    background: "rgba(99,179,237,0.06)",
    borderBottom: "1px solid rgba(99,179,237,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "grab",
    userSelect: "none",
  },
  headerLeft: { display: "flex", alignItems: "center", gap: "10px" },
  dot: (color) => ({
    width: "8px", height: "8px", borderRadius: "50%",
    background: color, flexShrink: 0,
  }),
  headerTitle: {
    color: "#e2e8f0",
    fontSize: "12px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  headerBadge: {
    fontSize: "10px",
    color: "#63b3ed",
    background: "rgba(99,179,237,0.12)",
    border: "1px solid rgba(99,179,237,0.25)",
    borderRadius: "4px",
    padding: "2px 7px",
    letterSpacing: "0.06em",
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "#4a5568",
    cursor: "pointer",
    fontSize: "18px",
    lineHeight: 1,
    padding: "2px 4px",
    borderRadius: "4px",
    transition: "color 0.15s",
  },

  // Captured text section
  capturedSection: { padding: "14px 18px 0" },
  sectionLabel: {
    fontSize: "10px",
    color: "#4a5568",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },
  capturedBox: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px",
    padding: "10px 12px",
    color: "#a0aec0",
    fontSize: "12.5px",
    lineHeight: "1.6",
    maxHeight: "72px",
    overflowY: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  placeholder: { color: "#2d3748", fontStyle: "italic" },

  // Action row
  actionRow: {
    padding: "12px 18px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  actionBtn: (active) => ({
    fontSize: "11px",
    padding: "5px 12px",
    borderRadius: "6px",
    border: `1px solid ${active ? "rgba(99,179,237,0.5)" : "rgba(255,255,255,0.08)"}`,
    background: active ? "rgba(99,179,237,0.12)" : "transparent",
    color: active ? "#63b3ed" : "#4a5568",
    cursor: "pointer",
    letterSpacing: "0.05em",
    transition: "all 0.15s",
    fontFamily: "inherit",
  }),

  // Analyze button
  analyzeBtn: (loading) => ({
    margin: "0 18px 14px",
    padding: "10px",
    borderRadius: "8px",
    background: loading
      ? "rgba(99,179,237,0.05)"
      : "linear-gradient(135deg, #1a3a5c, #0f2744)",
    border: `1px solid ${loading ? "rgba(99,179,237,0.15)" : "rgba(99,179,237,0.35)"}`,
    color: loading ? "#4a5568" : "#63b3ed",
    cursor: loading ? "not-allowed" : "pointer",
    fontSize: "12px",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontFamily: "inherit",
    fontWeight: "600",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  }),

  // Suggestions area
  suggestionsArea: {
    flex: 1,
    overflowY: "auto",
    padding: "0 18px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  // Suggestion card
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "12px 14px",
    transition: "border-color 0.2s, background 0.2s",
    cursor: "default",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  cardType: (color) => ({
    fontSize: "10px",
    color: color,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    fontWeight: "600",
  }),
  applyBtn: {
    fontSize: "10px",
    padding: "3px 10px",
    borderRadius: "5px",
    border: "1px solid rgba(72,187,120,0.35)",
    background: "rgba(72,187,120,0.08)",
    color: "#48bb78",
    cursor: "pointer",
    fontFamily: "inherit",
    letterSpacing: "0.06em",
    transition: "all 0.15s",
  },
  cardText: {
    color: "#cbd5e0",
    fontSize: "13px",
    lineHeight: "1.55",
  },
  cardMeta: {
    marginTop: "6px",
    fontSize: "11px",
    color: "#2d3748",
  },

  // Status/loading
  statusRow: {
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#4a5568",
    fontSize: "12px",
  },
  spinner: {
    width: "14px",
    height: "14px",
    border: "2px solid rgba(99,179,237,0.15)",
    borderTop: "2px solid #63b3ed",
    borderRadius: "50%",
    animation: "aca-spin 0.8s linear infinite",
    flexShrink: 0,
  },
};

// ─── Suggestion type config ────────────────────────────────────────────────────
const TYPES = {
  grammar: { label: "Grammar Fix", color: "#f6ad55" },
  rewrite: { label: "Rewrite", color: "#63b3ed" },
  reply: { label: "Smart Reply", color: "#b794f4" },
  code: { label: "Code Fix", color: "#68d391" },
};

// ─── Mock AI response (replace with real API call later) ──────────────────────
function mockAnalyze(text, mode) {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (mode === "grammar") {
        resolve([
          {
            type: "grammar",
            suggestion: text
              .replace(/\bi\b/g, "I")
              .replace(/\s{2,}/g, " ")
              .trim() + (text.endsWith(".") ? "" : "."),
            explanation: "Fixed capitalization and added punctuation.",
          },
        ]);
      } else if (mode === "reply") {
        resolve([
          { type: "reply", suggestion: "Thanks for the update! I'll get back to you shortly.", explanation: "Professional & friendly" },
          { type: "reply", suggestion: "Got it, noted. Will follow up by EOD.", explanation: "Concise & direct" },
        ]);
      } else if (mode === "code") {
        resolve([
          { type: "code", suggestion: "// Consider adding error handling here\ntry {\n  " + text + "\n} catch (err) {\n  console.error(err);\n}", explanation: "Wrapped in try/catch for safety." },
        ]);
      } else {
        resolve([
          { type: "rewrite", suggestion: "Here's a clearer version of your text, rewritten for better flow and readability.", explanation: "Improved clarity and structure." },
        ]);
      }
    }, 1400);
  });
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FloatingPanel() {
  const [open, setOpen] = useState(false);
  const [capturedText, setCapturedText] = useState("");
  const [mode, setMode] = useState("grammar");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [applied, setApplied] = useState(null);
  const panelRef = useRef(null);

  // Inject keyframe animations once
  useEffect(() => {
    if (document.getElementById("aca-styles")) return;
    const style = document.createElement("style");
    style.id = "aca-styles";
    style.textContent = `
      @keyframes aca-spin { to { transform: rotate(360deg); } }
      @keyframes aca-pulse {
        0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.45), 0 0 0 0 rgba(99,179,237,0.4); }
        50% { box-shadow: 0 4px 24px rgba(0,0,0,0.45), 0 0 0 8px rgba(99,179,237,0); }
      }
      @keyframes aca-slide-in {
        from { opacity: 0; transform: translateY(12px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0)   scale(1); }
      }
      .aca-panel-enter { animation: aca-slide-in 0.22s ease forwards; }
      .aca-card:hover { border-color: rgba(99,179,237,0.22) !important; background: rgba(255,255,255,0.05) !important; }
      .aca-apply:hover { background: rgba(72,187,120,0.18) !important; }
      .aca-action:hover { border-color: rgba(99,179,237,0.4) !important; color: #a0c4e2 !important; }
      .aca-close:hover { color: #a0aec0 !important; }
    `;
    document.head.appendChild(style);
  }, []);

  const handleAnalyze = async () => {
    if (!capturedText.trim() || loading) return;
    setLoading(true);
    setSuggestions([]);
    setApplied(null);
    const results = await mockAnalyze(capturedText, mode);
    setSuggestions(results);
    setLoading(false);
  };

  const handleApply = (suggestion, idx) => {
    // In the real extension, this will inject text into the active input
    setCapturedText(suggestion);
    setApplied(idx);
  };

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        style={styles.trigger}
        onClick={() => { setOpen((o) => !o); setSuggestions([]); }}
        title="AI Context Assistant"
      >
        <svg style={styles.triggerIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" opacity="0" />
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/>
          <circle cx="8.5" cy="11" r="1.5"/><circle cx="12" cy="11" r="1.5"/><circle cx="15.5" cy="11" r="1.5"/>
        </svg>
      </button>

      {/* ── Floating panel ── */}
      {open && (
        <div ref={panelRef} style={styles.panel} className="aca-panel-enter">

          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <span style={styles.dot("#48bb78")} />
              <span style={styles.headerTitle}>AI Assistant</span>
              <span style={styles.headerBadge}>v0.1</span>
            </div>
            <button
              style={styles.closeBtn}
              className="aca-close"
              onClick={() => setOpen(false)}
            >×</button>
          </div>

          {/* Captured text */}
          <div style={styles.capturedSection}>
            <div style={styles.sectionLabel}>Captured Text</div>
            <div style={styles.capturedBox}>
              {capturedText
                ? capturedText
                : <span style={styles.placeholder}>Start typing in a text field… it will appear here.</span>
              }
            </div>
            {/* For demo: manual input */}
            <textarea
              placeholder="Or paste text here to test…"
              value={capturedText}
              onChange={(e) => { setCapturedText(e.target.value); setSuggestions([]); }}
              style={{
                width: "100%", marginTop: "8px", padding: "8px 10px",
                background: "rgba(99,179,237,0.05)",
                border: "1px solid rgba(99,179,237,0.15)",
                borderRadius: "7px", color: "#a0aec0", fontSize: "12px",
                fontFamily: "inherit", resize: "none", outline: "none",
                boxSizing: "border-box", lineHeight: "1.5", minHeight: "52px",
              }}
              rows={2}
            />
          </div>

          {/* Mode buttons */}
          <div style={styles.actionRow}>
            {Object.entries(TYPES).map(([key, { label }]) => (
              <button
                key={key}
                style={styles.actionBtn(mode === key)}
                className="aca-action"
                onClick={() => { setMode(key); setSuggestions([]); }}
              >{label}</button>
            ))}
          </div>

          {/* Analyze button */}
          <button
            style={styles.analyzeBtn(loading || !capturedText.trim())}
            onClick={handleAnalyze}
            disabled={loading || !capturedText.trim()}
          >
            {loading && <div style={styles.spinner} />}
            {loading ? "Analyzing…" : "✦ Analyze"}
          </button>

          {/* Suggestions */}
          <div style={styles.suggestionsArea}>
            {loading && (
              <div style={styles.statusRow}>
                <div style={styles.spinner} />
                <span>Thinking…</span>
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div style={{ ...styles.statusRow, justifyContent: "center", color: "#2d3748", fontSize: "11px" }}>
                {capturedText ? "Press Analyze to get suggestions" : "No text captured yet"}
              </div>
            )}

            {suggestions.map((s, i) => {
              const typeConfig = TYPES[s.type] || TYPES.rewrite;
              return (
                <div key={i} style={styles.card} className="aca-card">
                  <div style={styles.cardHeader}>
                    <span style={styles.cardType(typeConfig.color)}>{typeConfig.label}</span>
                    <button
                      style={{
                        ...styles.applyBtn,
                        ...(applied === i ? { background: "rgba(72,187,120,0.22)", color: "#68d391" } : {}),
                      }}
                      className="aca-apply"
                      onClick={() => handleApply(s.suggestion, i)}
                    >
                      {applied === i ? "✓ Applied" : "Apply"}
                    </button>
                  </div>
                  <div style={styles.cardText}>{s.suggestion}</div>
                  {s.explanation && (
                    <div style={styles.cardMeta}>↳ {s.explanation}</div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      )}
    </>
  );
}
