// Toggle this to false when pushing to production/Vercel
export const IS_LOCAL = true;

export const API_BASE_URL = IS_LOCAL
  ? "http://localhost:5001/api"
  : "https://hci-proj.vercel.app/api";

// ─── Game Session Constants ───────────────────────────────────────────────────
// How often (in milliseconds) to log a coordinate sample during gameplay.
// Lower = more detail but larger payload. Recommended: 150–500ms.
export const COORD_SAMPLE_INTERVAL_MS = 1000; // 1 sample per second

// Maximum number of coordinates to store per session (prevents huge payloads).
export const MAX_COORDS_PER_SESSION = 300;
