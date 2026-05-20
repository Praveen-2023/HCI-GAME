// Toggle this to false when pushing to production/Vercel
export const IS_LOCAL = true;

export const API_BASE_URL = IS_LOCAL
  ? "http://localhost:5001/api"
  : "https://hci-proj.vercel.app/api";
