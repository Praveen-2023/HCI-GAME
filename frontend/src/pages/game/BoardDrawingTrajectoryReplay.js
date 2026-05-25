import React, { useEffect, useMemo, useRef, useState } from "react";

const validPath = (path) =>
  Array.isArray(path)
    ? path.filter((point) => point && typeof point.x === "number" && typeof point.y === "number")
    : [];

const getAbsoluteCoords = (point, canvasWidth, canvasHeight) => {
  const x = typeof point.screenX === "number" ? point.screenX : point.x * canvasWidth;
  const y = typeof point.screenY === "number" ? point.screenY : point.y * canvasHeight;
  return { ...point, absX: x, absY: y };
};

const pathPoints = (path) =>
  path.map((point) => `${point.absX},${point.absY}`).join(" ");

const getShapeName = (attempt) =>
  attempt?.requestedShape || attempt?.shapeType || "shape";

const SHAPE_COMPLEXITY_MULTIPLIERS = {
  circle: 1.0,
  ellipse: 1.2,
  triangle: 1.2,
  square: 1.2,
  diamond: 1.3,
  hexagon: 1.5,
  heart: 2.0,
  star: 2.5,
};

const AttemptReplayCard = ({ attempt, index }) => {
  const canvasWidth = attempt?.canvasWidth || 100;
  const canvasHeight = attempt?.canvasHeight || 100;
  const scale = (canvasWidth || 100) / 100;
  const safeZoneRadius = attempt?.safeZoneRadius ?? 0.025;
  const warningZoneRadius = attempt?.warningZoneRadius ?? 0.05;

  const targetPath = useMemo(() =>
    validPath(attempt?.targetPath).map((p) => getAbsoluteCoords(p, canvasWidth, canvasHeight)),
    [attempt?.targetPath, canvasWidth, canvasHeight]
  );
  
  const drawnPath = useMemo(() =>
    validPath(attempt?.drawnPath).map((p) => {
      const abs = getAbsoluteCoords(p, canvasWidth, canvasHeight);
      if (!abs.zone || !abs.color) {
        if (targetPath.length < 2) {
          abs.zone = 'safe';
          abs.color = '#51cf66';
        } else {
          let minDistance = 999;
          const nx = abs.absX / (canvasWidth || 100);
          const ny = abs.absY / (canvasHeight || 100);
          for (let i = 0; i < targetPath.length; i++) {
            const t1 = targetPath[i];
            const t2 = targetPath[(i + 1) % targetPath.length];
            const n1x = t1.absX / (canvasWidth || 100);
            const n1y = t1.absY / (canvasHeight || 100);
            const n2x = t2.absX / (canvasWidth || 100);
            const n2y = t2.absY / (canvasHeight || 100);
            const l2 = Math.hypot(n1x - n2x, n1y - n2y) ** 2;
            if (l2 === 0) {
              minDistance = Math.min(minDistance, Math.hypot(nx - n1x, ny - n1y));
              continue;
            }
            let t = ((nx - n1x) * (n2x - n1x) + (ny - n1y) * (n2y - n1y)) / l2;
            t = Math.max(0, Math.min(1, t));
            const px = n1x + t * (n2x - n1x);
            const py = n1y + t * (n2y - n1y);
            minDistance = Math.min(minDistance, Math.hypot(nx - px, ny - py));
          }
          if (minDistance >= warningZoneRadius) {
            abs.zone = 'danger';
            abs.color = '#ff6b6b';
          } else if (minDistance >= safeZoneRadius) {
            abs.zone = 'warning';
            abs.color = '#fcc419';
          } else {
            abs.zone = 'safe';
            abs.color = '#51cf66';
          }
        }
      }
      return abs;
    }),
    [attempt?.drawnPath, canvasWidth, canvasHeight, targetPath, safeZoneRadius, warningZoneRadius]
  );

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showColorZones, setShowColorZones] = useState(false);
  const timerRef = useRef(null);

  const calculatedQuality = useMemo(() => {
    if (attempt?.traceQuality !== undefined) return attempt.traceQuality;
    if (drawnPath.length === 0) return 100;
    const safe = drawnPath.filter((p) => p.zone === "safe").length;
    const warn = drawnPath.filter((p) => p.zone === "warning").length;
    const danger = drawnPath.filter((p) => p.zone === "danger").length;
    return Math.round(((safe * 1 + warn * 0.5 + danger * 0.1) / drawnPath.length) * 100);
  }, [attempt?.traceQuality, drawnPath]);

  const calculatedPoints = useMemo(() => {
    if (attempt?.pointsEarned !== undefined) return attempt.pointsEarned;
    const hits = attempt?.hits || 0;
    const total = attempt?.total || 20;
    const shapeName = getShapeName(attempt).toLowerCase();
    const multiplier = SHAPE_COMPLEXITY_MULTIPLIERS[shapeName] || 1.0;
    return Math.round(hits * (1 + hits / total) * multiplier * (calculatedQuality / 100));
  }, [attempt?.pointsEarned, attempt?.hits, attempt?.total, attempt, calculatedQuality]);

  const safeIdx = drawnPath.length > 0 ? Math.min(currentIdx, drawnPath.length - 1) : 0;
  const currentPoint = drawnPath[safeIdx] || drawnPath[0];
  const playedPath = drawnPath.slice(0, safeIdx + 1);
  const completion = Math.round((attempt?.completion || 0) * 100);

  useEffect(() => {
    setCurrentIdx(0);
    setIsPlaying(false);
  }, [attempt]);

  useEffect(() => {
    if (!isPlaying || drawnPath.length < 2) {
      if (timerRef.current) clearInterval(timerRef.current);
      return undefined;
    }

    timerRef.current = setInterval(() => {
      setCurrentIdx((prev) => {
        if (prev >= drawnPath.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, Math.max(8, Math.min(80, 36 / playbackSpeed)));

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, drawnPath.length, playbackSpeed]);

  let totalDistance = 0;
  for (let i = 1; i < drawnPath.length; i++) {
    totalDistance += Math.hypot(
      drawnPath[i].x - drawnPath[i - 1].x,
      drawnPath[i].y - drawnPath[i - 1].y,
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm font-black text-gray-800 dark:text-white">
            Attempt {index + 1}: {getShapeName(attempt)}
          </h4>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Black line is the board figure. Yellow line is exactly what the user traced.
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
            attempt?.success
              ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
          }`}>
            {completion}%
          </span>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {drawnPath.length} frames
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_220px] gap-4">
        <div>
          <div
            className="relative w-full bg-[#a8d9a8] rounded-xl overflow-hidden border border-green-200 shadow-inner"
            style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.34),transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.18),rgba(74,163,81,0.16))]" />
            <svg
              viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
              className="w-full h-full p-5"
              preserveAspectRatio="xMidYMid meet"
              style={{ aspectRatio: `${canvasWidth} / ${canvasHeight}` }}
            >
              {showColorZones && targetPath.length > 1 && (
                <>
                  {/* Warning Zone Halo */}
                  <polyline
                    points={pathPoints(targetPath)}
                    fill="none"
                    stroke="rgba(252, 196, 25, 0.25)"
                    strokeWidth={warningZoneRadius * 200 * scale}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Safe Zone Halo */}
                  <polyline
                    points={pathPoints(targetPath)}
                    fill="none"
                    stroke="rgba(81, 207, 102, 0.4)"
                    strokeWidth={safeZoneRadius * 200 * scale}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {targetPath.length > 1 && (
                <polyline
                  points={pathPoints(targetPath)}
                  fill="none"
                  stroke="#2f2f35"
                  strokeWidth={1.4 * scale}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
              {showColorZones ? (
                drawnPath.length > 1 &&
                drawnPath.slice(1).map((p2, idx) => {
                  const p1 = drawnPath[idx];
                  return (
                    <line
                      key={idx}
                      x1={p1.absX}
                      y1={p1.absY}
                      x2={p2.absX}
                      y2={p2.absY}
                      stroke={p2.color || "#ff9500"}
                      strokeWidth={0.7 * scale}
                      strokeOpacity="0.35"
                      strokeLinecap="round"
                    />
                  );
                })
              ) : (
                drawnPath.length > 1 && (
                  <polyline
                    points={pathPoints(drawnPath)}
                    fill="none"
                    stroke="#ff9500"
                    strokeWidth={0.7 * scale}
                    strokeOpacity="0.35"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )
              )}
              {showColorZones ? (
                playedPath.length > 1 &&
                playedPath.slice(1).map((p2, idx) => {
                  const p1 = playedPath[idx];
                  return (
                    <line
                      key={idx}
                      x1={p1.absX}
                      y1={p1.absY}
                      x2={p2.absX}
                      y2={p2.absY}
                      stroke={p2.color || "#ff9500"}
                      strokeWidth={2.4 * scale}
                      strokeLinecap="round"
                    />
                  );
                })
              ) : (
                playedPath.length > 1 && (
                  <polyline
                    points={pathPoints(playedPath)}
                    fill="none"
                    stroke="#ff9500"
                    strokeWidth={2.4 * scale}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )
              )}
              {drawnPath[0] && (
                <circle cx={drawnPath[0].absX} cy={drawnPath[0].absY} r={1.5 * scale} fill="#2563EB" />
              )}
              {drawnPath[drawnPath.length - 1] && (
                <circle cx={drawnPath[drawnPath.length - 1].absX} cy={drawnPath[drawnPath.length - 1].absY} r={1.5 * scale} fill="#DC2626" />
              )}
              {currentPoint && (
                <>
                  <circle cx={currentPoint.absX} cy={currentPoint.absY} r={3.4 * scale} fill={showColorZones ? (currentPoint.color || "#ff9500") : "#ff9500"} fillOpacity="0.25" />
                  <circle cx={currentPoint.absX} cy={currentPoint.absY} r={1.5 * scale} fill={showColorZones ? (currentPoint.color || "#ff9500") : "#ff9500"} stroke="#2f2f35" strokeWidth={0.35 * scale} />
                </>
              )}
            </svg>

            {showColorZones ? (
              <div className="absolute left-3 top-3 flex flex-wrap gap-2 rounded-lg bg-white/80 px-2 py-1 text-[10px] font-black text-gray-700 shadow-sm border border-white/60">
                <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-[#2f2f35]" /> Target</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#51cf66]" /> Safe</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#fcc419]" /> Warning</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#ff6b6b]" /> Danger</span>
              </div>
            ) : (
              <div className="absolute left-3 top-3 flex gap-2 rounded-lg bg-white/80 px-2 py-1 text-[10px] font-black text-gray-700 shadow-sm border border-white/60">
                <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-[#2f2f35]" /> Target</span>
                <span className="flex items-center gap-1"><span className="h-0.5 w-4 bg-[#ff9500]" /> User</span>
              </div>
            )}
            <div className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-mono text-gray-600 shadow-sm border border-gray-200">
              {safeIdx + 1}/{drawnPath.length}
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-3 py-2 rounded-xl text-xs font-black text-white transition-all active:scale-95 ${
                isPlaying ? "bg-amber-600" : "bg-gray-950 dark:bg-primary-600"
              }`}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => { setIsPlaying(false); setCurrentIdx(0); }}
              className="px-3 py-2 rounded-xl text-xs font-black bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowColorZones(!showColorZones)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${
                showColorZones ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
              }`}
            >
              🌈 Color Trajectory: {showColorZones ? "ON" : "OFF"}
            </button>
            <input
              type="range"
              min="0"
              max={Math.max(0, drawnPath.length - 1)}
              value={safeIdx}
              onChange={(event) => {
                setIsPlaying(false);
                setCurrentIdx(parseInt(event.target.value, 10));
              }}
              className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
            />
            <select
              value={playbackSpeed}
              onChange={(event) => setPlaybackSpeed(parseFloat(event.target.value))}
              className="px-2 py-1.5 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none cursor-pointer dark:text-white"
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="4">4x</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 text-xs">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Attempt Data</p>
          <div className="space-y-2.5">
            <div className="flex justify-between gap-3 border-b dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Shape</span>
              <span className="font-bold text-gray-800 dark:text-white capitalize">{getShapeName(attempt)}</span>
            </div>
            <div className="flex justify-between gap-3 border-b dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Score</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">+{calculatedPoints} pts</span>
            </div>
            <div className="flex justify-between gap-3 border-b dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Trace Quality</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{calculatedQuality}%</span>
            </div>
            <div className="flex justify-between gap-3 border-b dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Hits</span>
              <span className="font-bold text-gray-800 dark:text-white">{attempt?.hits || 0}/{attempt?.total || 0}</span>
            </div>
            <div className="flex justify-between gap-3 border-b dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Point Frame Time</span>
              <span className="font-bold font-mono text-gray-800 dark:text-white">{currentPoint?.timestamp !== undefined ? `${currentPoint.timestamp}s` : "—"}</span>
            </div>
            <div className="flex justify-between gap-3 border-b dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Distance</span>
              <span className="font-bold text-gray-800 dark:text-white">{totalDistance.toFixed(3)}</span>
            </div>
            <div className="flex justify-between gap-3 border-b dark:border-gray-700 pb-2">
              <span className="text-gray-500 dark:text-gray-400">Canvas</span>
              <span className="font-bold text-gray-800 dark:text-white">{canvasWidth || "auto"} x {canvasHeight || "auto"}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500 dark:text-gray-400">Current X,Y</span>
              <span className="font-bold font-mono text-gray-800 dark:text-white">
                {(currentPoint?.x ?? 0).toFixed(3)}, {(currentPoint?.y ?? 0).toFixed(3)}
              </span>
            </div>
            <div className="border-t dark:border-gray-700 my-2 pt-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">🔧 Tracing Zone Adjustments</p>
              <div className="space-y-1.5">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">🟢 Safe Zone</span>
                  <span className="font-bold text-gray-800 dark:text-white">{(safeZoneRadius * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">🟡 Warning</span>
                  <span className="font-bold text-gray-800 dark:text-white">{(warningZoneRadius * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BoardDrawingTrajectoryReplay = ({ attempts }) => {
  const cleanAttempts = useMemo(
    () =>
      Array.isArray(attempts)
        ? attempts.filter((attempt) => validPath(attempt?.drawnPath).length > 1)
        : [],
    [attempts],
  );

  if (cleanAttempts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 text-center mt-6 shadow-sm">
        <div className="mb-3 text-5xl">✏️</div>
        <p className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-lg">No Board Drawing Trajectory Yet</p>
        <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
          New board drawing sessions will save every partial and complete trace with the board figure behind it.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 mt-6 shadow-sm">
      <div className="mb-5 border-b dark:border-gray-700 pb-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
          Board Drawing Movement Path Trajectory & Replay
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-medium">
          Every attempt is shown separately: black target board line plus yellow/orange user trajectory.
        </p>
      </div>

      <div className="space-y-5">
        {cleanAttempts.map((attempt, index) => (
          <AttemptReplayCard
            key={`${attempt.startedAt || index}-${attempt.endedAt || "end"}-${getShapeName(attempt)}`}
            attempt={attempt}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default BoardDrawingTrajectoryReplay;
