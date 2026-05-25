/**
 * GameAnalytics.jsx
 * ──────────────────────────────────────────────────────────────────────────
 * Standalone analytics viewer for BoardDrawingGame local saves.
 *
 * Usage (same folder as BoardDrawingGame.js):
 *   import GameAnalytics from "./GameAnalytics";
 *
 * Route it however you like, e.g.:
 *   <Route path="/analytics" element={<GameAnalytics />} />
 *
 * The component reads from localStorage via gameStorage.js and accepts an
 * optional ?gameId= query-param to jump straight to a specific game.
 * ──────────────────────────────────────────────────────────────────────────
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import * as GameStorage from "./gameStorage";

// ── tiny helpers ──────────────────────────────────────────────────────────

const fmtDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const fmtDuration = (startIso, endIso) => {
  if (!startIso || !endIso) return "—";
  const s = Math.round((new Date(endIso) - new Date(startIso)) / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
};

const pct = (n) => `${Math.round(n ?? 0)}%`;

const COLORS = {
  bg: "#0f1117",
  panel: "#181c27",
  border: "#2a2f3e",
  accent: "#f97316",       // orange (drawn path)
  accentBg: "#15300a",
  green: "#4ade80",
  blue: "#60a5fa",
  red: "#f87171",
  muted: "#6b7280",
  text: "#e2e8f0",
  textSub: "#94a3b8",
  shapeLine: "#334155",
};

// ── Canvas overlay component ──────────────────────────────────────────────

/**
 * Draws bgCoordinates (shape outline) + gameCoordinates (drawn path) on a canvas.
 * Points are normalised 0-1 so we map to canvas pixel space.
 */
const TraceCanvas = ({ bgCoordinates = [], gameCoordinates = [], width = 320, height = 220 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = "#0d1520";
    ctx.fillRect(0, 0, width, height);

    const toX = (x) => x * width;
    const toY = (y) => y * height;

    // Draw shape outline (bg path)
    if (bgCoordinates.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = COLORS.shapeLine;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.moveTo(toX(bgCoordinates[0].x), toY(bgCoordinates[0].y));
      bgCoordinates.forEach((p) => ctx.lineTo(toX(p.x), toY(p.y)));
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw shape points
      bgCoordinates.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(toX(p.x), toY(p.y), 4, 0, Math.PI * 2);
        ctx.fillStyle = i === 0 ? COLORS.green : COLORS.blue;
        ctx.fill();
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    // Draw game coordinates (yellow trace)
    if (gameCoordinates.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = COLORS.accent;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(toX(gameCoordinates[0].x), toY(gameCoordinates[0].y));
      gameCoordinates.forEach((p) => ctx.lineTo(toX(p.x), toY(p.y)));
      ctx.stroke();

      // Draw start & end markers
      const first = gameCoordinates[0];
      const last = gameCoordinates[gameCoordinates.length - 1];
      ctx.beginPath();
      ctx.arc(toX(first.x), toY(first.y), 6, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.green;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(toX(last.x), toY(last.y), 6, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.red;
      ctx.fill();
    }
  }, [bgCoordinates, gameCoordinates, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ borderRadius: 8, display: "block" }}
    />
  );
};

// ── Completion ring ───────────────────────────────────────────────────────

const Ring = ({ value, size = 56, stroke = 6, color = COLORS.accent }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.border} strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%", transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize={12} fill={COLORS.text} fontWeight="700">
        {Math.round(value)}%
      </text>
    </svg>
  );
};

// ── Bar chart for shape breakdown ─────────────────────────────────────────

const ShapeBar = ({ label, attempts, successes }) => {
  const rate = attempts > 0 ? (successes / attempts) * 100 : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: COLORS.textSub, marginBottom: 3 }}>
        <span style={{ textTransform: "capitalize" }}>{label}</span>
        <span style={{ color: COLORS.text }}>{successes}/{attempts}</span>
      </div>
      <div style={{ background: COLORS.border, borderRadius: 4, height: 8, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${rate}%`, background: rate >= 80 ? COLORS.green : rate >= 50 ? COLORS.accent : COLORS.red, borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────

const GameAnalytics = () => {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [selectedTryId, setSelectedTryId] = useState(null);
  const [view, setView] = useState("list"); // "list" | "game" | "try"
  const [importError, setImportError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const refreshList = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GameStorage.getAllGames();
      setGames(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGameDetail = useCallback(async (gid) => {
    setLoading(true);
    try {
      const data = await GameStorage.getGame(gid);
      setSelectedGame(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // On mount, read ?gameId from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gid = params.get("gameId");
    refreshList();
    if (gid) {
      setSelectedGameId(gid);
      loadGameDetail(gid);
      setView("game");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedGameId && view === "game" && selectedGame?.gameId !== selectedGameId) {
      loadGameDetail(selectedGameId);
    }
  }, [selectedGameId, view, selectedGame, loadGameDetail]);



  const selectedTry = useMemo(
    () => (selectedGame?.tries ?? []).find((t) => t.tryId === selectedTryId) ?? null,
    [selectedGame, selectedTryId]
  );

  // ── aggregate stats across all games ──
  const overallStats = useMemo(() => {
    if (!games.length) return null;
    const completed = games.filter((g) => g.completed);
    const totalScore = games.reduce((s, g) => s + (g.totalScore ?? 0), 0);
    const totalReps = games.reduce((s, g) => s + (g.totalReps ?? 0), 0);
    const allTries = games.flatMap((g) => g.tries ?? []);
    const successTries = allTries.filter((t) => t.completed);
    const avgRate = allTries.length
      ? Math.round((successTries.length / allTries.length) * 100)
      : 0;
    const avgCompletion = allTries.length
      ? Math.round(allTries.reduce((s, t) => s + (t.percentComplete ?? 0), 0) / allTries.length)
      : 0;
    // shape breakdown across all games
    const shapeBreakdown = {};
    allTries.forEach((t) => {
      const k = t.shapeType ?? "unknown";
      if (!shapeBreakdown[k]) shapeBreakdown[k] = { attempts: 0, successes: 0 };
      shapeBreakdown[k].attempts++;
      if (t.completed) shapeBreakdown[k].successes++;
    });
    return { totalGames: games.length, completedGames: completed.length, totalScore, totalReps, avgRate, avgCompletion, totalTries: allTries.length, shapeBreakdown };
  }, [games]);

  const handleDeleteGame = async (gid) => {
    if (!window.confirm("Delete this game record permanently?")) return;
    await GameStorage.deleteGame(gid);
    refreshList();
    if (gid === selectedGameId) { setSelectedGameId(null); setView("list"); }
  };

  const handleExport = (gid) => GameStorage.exportGameJson(gid);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const obj = await GameStorage.importGameJson(file);
      const added = await GameStorage.addImportedGame(obj);
      if (added) { setImportError(""); refreshList(); }
      else setImportError("Game already imported (same id).");
    } catch {
      setImportError("Invalid file — must be a game JSON export.");
    }
    e.target.value = "";
  };

  const handleClearAll = async () => {
    if (!window.confirm("Delete ALL saved games? This cannot be undone.")) return;
    await GameStorage.clearAll();
    setGames([]);
    setSelectedGameId(null);
    setView("list");
  };

  // ── styles ──
  const s = {
    root: { minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'DM Mono', 'Fira Mono', monospace, system-ui", fontSize: 14 },
    header: { background: COLORS.panel, borderBottom: `1px solid ${COLORS.border}`, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" },
    headerTitle: { fontSize: 20, fontWeight: 700, color: COLORS.accent, letterSpacing: "-0.5px", margin: 0 },
    breadcrumb: { display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.muted, flexWrap: "wrap" },
    crumbBtn: { background: "none", border: "none", cursor: "pointer", color: COLORS.textSub, padding: "2px 6px", borderRadius: 4, fontSize: 13 },
    crumbActive: { color: COLORS.text, fontWeight: 600 },
    main: { padding: 24, maxWidth: 1200, margin: "0 auto" },
    sectionTitle: { fontSize: 13, textTransform: "uppercase", letterSpacing: "1px", color: COLORS.muted, marginBottom: 12, marginTop: 0 },
    card: { background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16, marginBottom: 12 },
    grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 24 },
    statCard: { background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "14px 16px" },
    statLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px", color: COLORS.muted, marginBottom: 4 },
    statValue: { fontSize: 28, fontWeight: 700, color: COLORS.accent },
    statSub: { fontSize: 11, color: COLORS.muted, marginTop: 2 },
    gameRow: { display: "flex", alignItems: "center", gap: 12, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 10, padding: "12px 16px", marginBottom: 8, cursor: "pointer", transition: "border-color 0.2s" },
    gameRowActive: { borderColor: COLORS.accent },
    badge: (ok) => ({ fontSize: 11, padding: "2px 8px", borderRadius: 4, fontWeight: 600, background: ok ? "#14432a" : "#3b1515", color: ok ? COLORS.green : COLORS.red }),
    tryRow: { display: "flex", alignItems: "center", gap: 10, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: "10px 14px", marginBottom: 6, cursor: "pointer", transition: "border-color 0.2s" },
    tryRowActive: { borderColor: COLORS.accent },
    btn: (variant = "default") => ({
      padding: "7px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
      background: variant === "accent" ? COLORS.accent : variant === "danger" ? "#7f1d1d" : COLORS.border,
      color: variant === "accent" ? "#000" : variant === "danger" ? COLORS.red : COLORS.textSub,
      transition: "opacity 0.15s",
    }),
    divider: { borderColor: COLORS.border, margin: "20px 0" },
    legend: { display: "flex", gap: 16, fontSize: 11, color: COLORS.muted, marginTop: 8, flexWrap: "wrap" },
    legendDot: (c) => ({ width: 10, height: 10, borderRadius: "50%", background: c, display: "inline-block", marginRight: 4 }),
  };

  // ── VIEWS ──

  const renderOverallStats = () => {
    if (!overallStats) return <p style={{ color: COLORS.muted }}>No games yet. Play a session to see analytics here.</p>;
    return (
      <>
        <p style={s.sectionTitle}>Overall Performance</p>
        <div style={s.grid2}>
          {[
            { label: "Total Games", value: overallStats.totalGames, sub: `${overallStats.completedGames} completed` },
            { label: "Total Score", value: overallStats.totalScore, sub: "across all sessions" },
            { label: "Shapes Completed", value: overallStats.totalReps, sub: "successful traces" },
            { label: "Success Rate", value: pct(overallStats.avgRate), sub: "across all tries" },
            { label: "Total Tries", value: overallStats.totalTries, sub: "drawing attempts" },
            { label: "Avg Completion", value: pct(overallStats.avgCompletion), sub: "points hit" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={s.statCard}>
              <div style={s.statLabel}>{label}</div>
              <div style={s.statValue}>{value}</div>
              <div style={s.statSub}>{sub}</div>
            </div>
          ))}
        </div>

        {Object.keys(overallStats.shapeBreakdown).length > 0 && (
          <div style={{ ...s.card, maxWidth: 480 }}>
            <p style={s.sectionTitle}>Shape Breakdown (All Time)</p>
            {Object.entries(overallStats.shapeBreakdown).map(([shape, d]) => (
              <ShapeBar key={shape} label={shape} attempts={d.attempts} successes={d.successes} />
            ))}
          </div>
        )}
      </>
    );
  };

  const renderGameList = () => (
    <>
      {renderOverallStats()}
      <hr style={s.divider} />
      <p style={s.sectionTitle}>Game History ({games.length})</p>
      {games.length === 0 && <p style={{ color: COLORS.muted }}>No saved games yet.</p>}
      {games.map((g) => (
        <div
          key={g.gameId}
          style={{ ...s.gameRow, ...(g.gameId === selectedGameId ? s.gameRowActive : {}) }}
          onClick={() => { setSelectedGameId(g.gameId); setSelectedTryId(null); setView("game"); }}
        >
          <Ring value={g.percentComplete ?? 0} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, color: COLORS.text, fontSize: 14 }}>
              Game #{g.gameIndex}
              <span style={{ ...s.badge(g.completed), marginLeft: 8 }}>{g.completed ? "complete" : "partial"}</span>
            </div>
            <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
              {fmtDate(g.startedAt)} · {fmtDuration(g.startedAt, g.endedAt)}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textSub, marginTop: 3 }}>
              Score {g.totalScore} · {g.totalReps} shapes · {(g.tries ?? []).length} tries
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
            <button style={s.btn("accent")} onClick={(e) => { e.stopPropagation(); handleExport(g.gameId); }}>↓ JSON</button>
            <button style={s.btn("danger")} onClick={(e) => { e.stopPropagation(); handleDeleteGame(g.gameId); }}>✕</button>
          </div>
        </div>
      ))}
    </>
  );

  const renderGameDetail = () => {
    if (!selectedGame) return null;
    const g = selectedGame;
    const tries = g.tries ?? [];
    const metrics = g.gameMetrics ?? {};

    return (
      <>
        {/* header card */}
        <div style={s.card}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <Ring value={g.percentComplete ?? 0} size={64} stroke={7} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text }}>
                Game #{g.gameIndex}
                <span style={{ ...s.badge(g.completed), marginLeft: 10, fontSize: 12 }}>
                  {g.completed ? "completed" : "partial / interrupted"}
                </span>
              </div>
              <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>
                {fmtDate(g.startedAt)} → {g.endedAt ? fmtDate(g.endedAt) : "in progress"} ({fmtDuration(g.startedAt, g.endedAt)})
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 12, flexWrap: "wrap" }}>
                {[
                  ["Score", g.totalScore],
                  ["Shapes", g.totalReps],
                  ["Success Rate", pct(g.successRate)],
                  ["Avg Completion", pct(metrics.avgCompletion)],
                  ["Tries", tries.length],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: COLORS.accent }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
            <button style={s.btn("accent")} onClick={() => handleExport(g.gameId)}>↓ Export JSON</button>
          </div>
        </div>

        {/* shape breakdown for this game */}
        {Object.keys(metrics.shapeBreakdown ?? {}).length > 0 && (
          <div style={{ ...s.card, maxWidth: 460 }}>
            <p style={{ ...s.sectionTitle, marginBottom: 10 }}>Shape Breakdown</p>
            {Object.entries(metrics.shapeBreakdown).map(([shape, d]) => (
              <ShapeBar key={shape} label={shape} attempts={d.attempts} successes={d.successes} />
            ))}
          </div>
        )}

        {/* current shape outline overview */}
        {g.bgCoordinates?.length > 1 && (
          <div style={s.card}>
            <p style={{ ...s.sectionTitle, marginBottom: 8 }}>Final Shape Outline (bg reference)</p>
            <TraceCanvas bgCoordinates={g.bgCoordinates} gameCoordinates={[]} width={320} height={200} />
            <div style={s.legend}>
              <span><span style={s.legendDot(COLORS.blue)} />Shape points</span>
              <span><span style={s.legendDot(COLORS.green)} />Start point</span>
            </div>
          </div>
        )}

        {/* tries list */}
        <p style={s.sectionTitle}>{tries.length} Drawing Tries — click to inspect</p>
        {tries.length === 0 && <p style={{ color: COLORS.muted }}>No tries recorded.</p>}
        {tries.map((t) => (
          <div
            key={t.tryId}
            style={{ ...s.tryRow, ...(t.tryId === selectedTryId ? s.tryRowActive : {}) }}
            onClick={() => { setSelectedTryId(t.tryId); setView("try"); }}
          >
            <Ring value={t.percentComplete ?? 0} size={44} stroke={5} color={t.completed ? COLORS.green : COLORS.red} />
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 600, textTransform: "capitalize" }}>{t.shapeType}</span>
              <span style={{ ...s.badge(t.completed), marginLeft: 8 }}>{t.completed ? "✓ success" : "✗ fail"}</span>
              <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                Try #{t.tryIndex} · {t.hand} hand · {t.hits}/{t.total} pts · score after: {t.scoreAfter}
              </div>
            </div>
            <span style={{ color: COLORS.accent, fontSize: 12 }}>›</span>
          </div>
        ))}
      </>
    );
  };

  const renderTryDetail = () => {
    if (!selectedTry || !selectedGame) return null;
    const t = selectedTry;

    return (
      <>
        {/* summary card */}
        <div style={s.card}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
            <Ring value={t.percentComplete} size={64} stroke={7} color={t.completed ? COLORS.green : COLORS.red} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.text, textTransform: "capitalize" }}>
                {t.shapeType} — Try #{t.tryIndex}
                <span style={{ ...s.badge(t.completed), marginLeft: 10 }}>{t.completed ? "Success" : "Failed"}</span>
              </div>
              <div style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>
                {t.hand} hand · started at session-sec {t.startedAt}s → {t.endedAt}s
              </div>
              <div style={{ display: "flex", gap: 24, marginTop: 12, flexWrap: "wrap" }}>
                {[
                  ["Points Hit", `${t.hits} / ${t.total}`],
                  ["Completion", pct(t.percentComplete)],
                  ["Score After", t.scoreAfter],
                  ["Path Points", t.gameCoordinates?.length ?? 0],
                ].map(([label, val]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: COLORS.muted, textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: t.completed ? COLORS.green : COLORS.accent }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay canvas */}
        <div style={s.card}>
          <p style={{ ...s.sectionTitle, marginBottom: 8 }}>Path Overlay — Shape vs Your Trace</p>
          <TraceCanvas
            bgCoordinates={t.bgCoordinates}
            gameCoordinates={t.gameCoordinates}
            width={Math.min(window.innerWidth - 96, 640)}
            height={Math.min(window.innerHeight * 0.45, 380)}
          />
          <div style={s.legend}>
            <span><span style={{ ...s.legendDot(COLORS.shapeLine), border: `1px dashed ${COLORS.blue}` }} />Target shape</span>
            <span><span style={s.legendDot(COLORS.blue)} />Shape points</span>
            <span><span style={s.legendDot(COLORS.accent)} />Your drawn path</span>
            <span><span style={s.legendDot(COLORS.green)} />Draw start</span>
            <span><span style={s.legendDot(COLORS.red)} />Draw end</span>
          </div>
        </div>

        {/* raw coordinate counts */}
        <div style={{ ...s.card, fontSize: 12, color: COLORS.muted }}>
          <p style={s.sectionTitle}>Raw Data</p>
          <p>bgCoordinates: {t.bgCoordinates?.length ?? 0} points</p>
          <p>gameCoordinates: {t.gameCoordinates?.length ?? 0} points</p>
          <p style={{ marginTop: 8, color: COLORS.textSub }}>
            Tip: Export the game JSON (from the game detail view) to get the full coordinate arrays for further analysis.
          </p>
        </div>
      </>
    );
  };

  // ── breadcrumb ──
  const renderBreadcrumb = () => (
    <div style={s.breadcrumb}>
      <button
        style={{ ...s.crumbBtn, ...(view === "list" ? s.crumbActive : {}) }}
        onClick={() => setView("list")}
      >All Games</button>
      {(view === "game" || view === "try") && selectedGame && (
        <>
          <span style={{ color: COLORS.border }}>/</span>
          <button
            style={{ ...s.crumbBtn, ...(view === "game" ? s.crumbActive : {}) }}
            onClick={() => { setView("game"); setSelectedTryId(null); }}
          >
            Game #{selectedGame.gameIndex}
          </button>
        </>
      )}
      {view === "try" && selectedTry && (
        <>
          <span style={{ color: COLORS.border }}>/</span>
          <span style={{ ...s.crumbBtn, ...s.crumbActive }}>
            Try #{selectedTry.tryIndex} · {selectedTry.shapeType}
          </span>
        </>
      )}
    </div>
  );

  return (
    <div style={s.root}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.headerTitle}>📊 Drawing Analytics</h1>
        {renderBreadcrumb()}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={s.btn()} onClick={() => fileInputRef.current?.click()}>⬆ Import JSON</button>
          <input ref={fileInputRef} type="file" accept=".json" style={{ display: "none" }} onChange={handleImport} />
          <button style={s.btn()} onClick={refreshList} disabled={loading}>
            {loading ? "↻ Loading..." : "↻ Refresh"}
          </button>
          {games.length > 0 && (
            <button style={s.btn("danger")} onClick={handleClearAll}>⚠ Clear All</button>
          )}
        </div>
      </div>

      {importError && (
        <div style={{ background: "#3b1515", color: COLORS.red, padding: "8px 24px", fontSize: 13 }}>
          {importError}
        </div>
      )}

      {/* Main content */}
      <div style={s.main}>
        {view === "list" && renderGameList()}
        {view === "game" && (
          <>
            <button style={{ ...s.btn(), marginBottom: 16 }} onClick={() => setView("list")}>← Back to all games</button>
            {renderGameDetail()}
          </>
        )}
        {view === "try" && (
          <>
            <button style={{ ...s.btn(), marginBottom: 16 }} onClick={() => { setView("game"); setSelectedTryId(null); }}>← Back to game</button>
            {renderTryDetail()}
          </>
        )}
      </div>
    </div>
  );
};

export default GameAnalytics;
