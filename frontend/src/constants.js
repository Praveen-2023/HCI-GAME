// Toggle this to false when pushing to production/Vercel
export const IS_LOCAL = false;

export const API_BASE_URL = IS_LOCAL
  ? "http://localhost:5001/api"
  : "https://hci-proj.vercel.app/api";

// ─── Game Session Constants ───────────────────────────────────────────────────
// How often (in milliseconds) to log a coordinate sample during gameplay.
// Lower = more detail but larger payload. Recommended: 150–500ms.
export const COORD_SAMPLE_INTERVAL_MS = 1000; // 1 sample per second

// Maximum number of coordinates to store per session (prevents huge payloads).
export const MAX_COORDS_PER_SESSION = 300;

// Default session duration for gameplay in seconds (e.g., 300 seconds = 5 minutes).
export const DEFAULT_SESSION_SECONDS = 300;

// ─── Game 1: Board Drawing Game Constants ──────────────────────────────────────
export const BOARD_DRAWING_CALIBRATION_SECONDS = 7;
export const BOARD_DRAWING_NUM_SHAPE_POINTS = 20;
export const BOARD_DRAWING_PICK_DISTANCE = 0.08;
export const BOARD_DRAWING_TRACE_TOLERANCE = 0.05;
export const BOARD_DRAWING_SCORE_PER_SHAPE = 10;
export const BOARD_DRAWING_MIN_COMPLETION = 0.8; // 80% points hit for success
export const BOARD_DRAWING_SMOOTH_ALPHA = 0.7;
export const BOARD_DRAWING_STABLE_FRAMES = 2;
export const BOARD_DRAWING_DRAW_FPS = 30;

// Safe zone defaults for Board Drawing Game
export const BOARD_DRAWING_DEFAULT_SAFE_ZONE_RADIUS = 0.025;     // 2.5%
export const BOARD_DRAWING_DEFAULT_WARNING_ZONE_RADIUS = 0.05;    // 5.0%

// ─── Game 2: Fruit Basket Game Constants ───────────────────────────────────────
export const FRUIT_BASKET_CALIBRATION_SECONDS = 20;
export const FRUIT_BASKET_HAND_TEST_DURATION_MS = 5000;
export const FRUIT_BASKET_GRID_ROWS = 3;
export const FRUIT_BASKET_GRID_COLS = 3;
export const FRUIT_BASKET_PICK_DISTANCE = 0.08;
export const FRUIT_BASKET_DROP_DISTANCE = 0.1;
export const FRUIT_BASKET_SCORE_PER_DROP = 10;
export const FRUIT_BASKET_SMOOTH_ALPHA = 0.7;
export const FRUIT_BASKET_STABLE_FRAMES = 2;
export const FRUIT_BASKET_DRAW_FPS = 30;
export const FRUIT_BASKET_PICK_DWELL_MS = 250;
export const FRUIT_BASKET_DROP_DWELL_MS = 250;
export const FRUIT_BASKET_TRIAL_TIMEOUT_MS = 10000;
export const FRUIT_BASKET_MIN_SHOULDER_VISIBILITY = 0.5;
export const FRUIT_BASKET_IDEAL_SHOULDER_Y_RANGE = [0.15, 0.6];
export const FRUIT_BASKET_MIN_SHOULDER_WIDTH = 0.12;

// ─── Game 3: Shape Tracing Game Constants ──────────────────────────────────────
export const SHAPE_TRACING_CALIBRATION_SECONDS = 7;
export const SHAPE_TRACING_NUM_SHAPE_POINTS = 20;
export const SHAPE_TRACING_PICK_DISTANCE = 0.08;
export const SHAPE_TRACING_TRACE_TOLERANCE = 0.03;
export const SHAPE_TRACING_SCORE_PER_SHAPE = 10;
export const SHAPE_TRACING_MIN_COMPLETION = 0.8;
export const SHAPE_TRACING_SMOOTH_ALPHA = 0.5;
export const SHAPE_TRACING_STABLE_FRAMES = 5;
export const SHAPE_TRACING_DRAW_FPS = 30;
