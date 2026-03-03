import { useState, useRef, useEffect, useCallback } from "react";
import useTextDetector from '../hooks/useTextDetector'
import { analyzText } from '../utils/api'

const PANEL_WIDTH = 360;
const PANEL_HEIGHT = 520;
const BUBBLE_SIZE = 52;
const MARGIN = 12;

// Smart position: panel flips so it's always fully visible
function getPanelPosition(bubbleX, bubbleY) {
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // Horizontal: open to left if bubble is in right half
  const openLeft = bubbleX + BUBBLE_SIZE + PANEL_WIDTH + MARGIN > screenW;
  const panelX = openLeft
    ? bubbleX - PANEL_WIDTH - MARGIN
    : bubbleX + BUBBLE_SIZE + MARGIN;

  // Vertical: open upward if bubble is in bottom half
  const openUp = bubbleY + PANEL_HEIGHT + MARGIN > screenH;
  const panelY = openUp
    ? bubbleY - PANEL_HEIGHT + BUBBLE_SIZE
    : bubbleY;

  // Clamp so panel never goes off screen
  return {
    x: Math.max(MARGIN, Math.min(panelX, screenW - PANEL_WIDTH - MARGIN)),
    y: Math.max(MARGIN, Math.min(panelY, screenH - PANEL_HEIGHT - MARGIN)),
  };
}

const styles = {
  trigger: (x, y, isDragging) => ({
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: `${BUBBLE_SIZE}px`,
    height: `${BUBBLE_SIZE}px`,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
    border: "1.5px solid rgba(99,179,237,0.35)",
    boxShadow: isDragging
      ? "0 8px 32px rgba(99,179,237,0.35)"
      : "0 4px 24px rgba(0,0,0,0.45)",
    cursor: isDragging ? "grabbing" : "grab",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999999,
    transition: isDragging ? "none" : "box-shadow 0.2s ease",
    animation: isDragging ? "none" : "aca-pulse 2.8s ease-in-out infinite",
    userSelect: "none",
  }),
  triggerIcon: { width: "22px", height: "22px", fill: "#63b3ed", pointerEvents: "none" },

  panel: (x, y) => ({
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: `${PANEL_WIDTH}px`,
    maxHeight: `${PANEL_HEIGHT}px`,
    background: "#0d1117",
    border: "1px solid rgba(99,179,237,0.18)",
    borderRadius: "16px",
    boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
    fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
    zIndex: 999998,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  }),

  header: {
    padding: "14px 18px",
    background: "rgba(99,179,237,0.06)",
    borderBottom: "1px solid rgba(99,179,237,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
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
  dragHint: {
    fontSize: "10px",
    color: "#2d3748",
    textAlign: "center",
    padding: "4px",
    letterSpacing: "0.08em",
  },
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
  analyzeBtn: (disabled) => ({
    margin: "0 18px 14px",
    padding: "10px",
    borderRadius: "8px",
    background: disabled
      ? "rgba(99,179,237,0.05)"
      : "linear-gradient(135deg, #1a3a5c, #0f2744)",
    border: `1px solid ${disabled ? "rgba(99,179,237,0.15)" : "rgba(99,179,237,0.35)"}`,
    color: disabled ? "#4a5568" : "#63b3ed",
    cursor: disabled ? "not-allowed" : "pointer",
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
  suggestionsArea: {
    flex: 1,
    overflowY: "auto",
    padding: "0 18px 18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "10px",
    padding: "12px 14px",
    transition: "border-color 0.2s, background 0.2s",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  cardType: (color) => ({
    fontSize: "10px",
    color,
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

const TYPES = {
  grammar: { label: "Grammar Fix", color: "#f6ad55" },
  rewrite: { label: "Rewrite",     color: "#63b3ed" },
  reply:   { label: "Smart Reply", color: "#b794f4" },
  code:    { label: "Code Fix",    color: "#68d391" },
};

export default function FloatingPanel() {
  const [pos, setPos] = useState({
    x: window.innerWidth - BUBBLE_SIZE - MARGIN,
    y: window.innerHeight - BUBBLE_SIZE - MARGIN,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [open, setOpen] = useState(false);
 const { capturedText, setCapturedText, applyText, activeElement, sourceSite } = useTextDetector();
  const [mode, setMode] = useState("grammar");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [applied, setApplied] = useState(null);
  const [error, setError] = useState(null);


  const dragStart = useRef(null);
  const hasDragged = useRef(false);

  // Inject keyframe animations once
  useEffect(() => {
    if (document.getElementById("aca-styles")) return;
    const style = document.createElement("style");
    style.id = "aca-styles";
    style.textContent = `
      @keyframes aca-spin { to { transform: rotate(360deg); } }
      @keyframes aca-pulse {
        0%, 100% { box-shadow: 0 4px 24px rgba(0,0,0,0.45), 0 0 0 0 rgba(99,179,237,0.4); }
        50%       { box-shadow: 0 4px 24px rgba(0,0,0,0.45), 0 0 0 8px rgba(99,179,237,0); }
      }
      @keyframes aca-slide-in {
        from { opacity: 0; transform: translateY(8px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      .aca-panel-enter { animation: aca-slide-in 0.2s ease forwards; }
      .aca-card:hover  { border-color: rgba(99,179,237,0.22) !important; background: rgba(255,255,255,0.05) !important; }
      .aca-apply:hover { background: rgba(72,187,120,0.18) !important; }
      .aca-close:hover { color: #a0aec0 !important; }
    `;
    document.head.appendChild(style);
  }, []);

  // ── Drag logic ──────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
    hasDragged.current = false;
    setIsDragging(true);
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragStart.current) return;
      const dx = e.clientX - dragStart.current.mouseX;
      const dy = e.clientY - dragStart.current.mouseY;

      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasDragged.current = true;
      }

      // Keep bubble fully inside viewport
      const newX = Math.min(Math.max(0, dragStart.current.posX + dx), window.innerWidth - BUBBLE_SIZE);
      const newY = Math.min(Math.max(0, dragStart.current.posY + dy), window.innerHeight - BUBBLE_SIZE);
      setPos({ x: newX, y: newY });
    };

    const onMouseUp = () => {
      dragStart.current = null;
      setIsDragging(false);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // Click only toggles panel if user didn't drag
  const handleClick = () => {
    if (hasDragged.current) return;
    setOpen((o) => !o);
    setSuggestions([]);
  };
const handleAnalyze = async () => {
  if (!capturedText.trim() || loading) return
  setLoading(true)
  setSuggestions([])
  setApplied(null)
  setError(null)

  try {
    const results = await analyzText(capturedText, mode)
    // Handle both array and single object responses
    setSuggestions(Array.isArray(results) ? results : [results])
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  const handleApply = (suggestion, idx) => {
  applyText(suggestion)
  setApplied(idx)
}
  // Calculate smart panel position every time bubble moves or panel opens
  const panelPos = getPanelPosition(pos.x, pos.y);

  return (
    <>
      {/* ── Draggable trigger bubble ── */}
      <button
        style={styles.trigger(pos.x, pos.y, isDragging)}
        onMouseDown={onMouseDown}
        onClick={handleClick}
        title="Drag to move · Click to open"
      >
        <svg style={styles.triggerIcon} viewBox="0 0 24 24">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z" />
          <circle cx="8.5" cy="11" r="1.5" />
          <circle cx="12" cy="11" r="1.5" />
          <circle cx="15.5" cy="11" r="1.5" />
        </svg>
      </button>

      {/* ── Smart-positioned panel ── */}
      {open && (
        <div style={styles.panel(panelPos.x, panelPos.y)} className="aca-panel-enter">

          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <span style={styles.dot("#48bb78")} />
              <span style={styles.headerTitle}>TypeMind</span>
              <span style={styles.headerBadge}>v0.1</span>
              <span style={styles.headerBadge}>v0.1</span>
{sourceSite && (
  <span style={{
    fontSize: "10px",
    color: "#68d391",
    background: "rgba(104,211,145,0.1)",
    border: "1px solid rgba(104,211,145,0.25)",
    borderRadius: "4px",
    padding: "2px 7px",
    letterSpacing: "0.06em",
  }}>{sourceSite}</span>
)}        </div>
            <button style={styles.closeBtn} className="aca-close" onClick={() => setOpen(false)}>×</button>
          </div>

          <div style={styles.dragHint}>⠿ drag the bubble to reposition</div>

          <div style={styles.capturedSection}>
            <div style={styles.sectionLabel}>Captured Text</div>
            <div style={styles.capturedBox}>
              {capturedText
                ? capturedText
                : <span style={styles.placeholder}>Start typing in a text field…</span>
              }
            </div>
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

          <div style={styles.actionRow}>
            {Object.entries(TYPES).map(([key, { label }]) => (
              <button
                key={key}
                style={styles.actionBtn(mode === key)}
                onClick={() => { setMode(key); setSuggestions([]); }}
              >{label}</button>
            ))}
          </div>

          <button
            style={styles.analyzeBtn(loading || !capturedText.trim())}
            onClick={handleAnalyze}
            disabled={loading || !capturedText.trim()}
          >
            {loading && <div style={styles.spinner} />}
            {loading ? "Analyzing…" : "✦ Analyze"}
          </button>

          <div style={styles.suggestionsArea}>
            {loading && (
              <div style={styles.statusRow}>
                <div style={styles.spinner} />
                <span>Thinking…</span>
              </div>
            )}

            {/* Error message */}
{error && (
  <div style={{
    padding: "12px 14px",
    background: "rgba(245,101,101,0.08)",
    border: "1px solid rgba(245,101,101,0.25)",
    borderRadius: "8px",
    color: "#fc8181",
    fontSize: "12px",
    lineHeight: "1.5",
  }}>
    ⚠ {error}
  </div>
)}

{/* Empty state */}
{!loading && !error && suggestions.length === 0 && (
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
                  {s.explanation && <div style={styles.cardMeta}>↳ {s.explanation}</div>}
                </div>
              );
            })}
          </div>

        </div>
      )}
    </>
  );
}
