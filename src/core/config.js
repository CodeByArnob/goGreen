/**
 * goGreen Core Configuration & Constants
 */

export const GRID_WEEKS = 53;
export const GRID_DAYS = 7; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

export const INTENSITY_LEVELS = {
  0: { min: 0, max: 0, label: "None", hex: "#161b22", ansi: "\x1b[90m■\x1b[0m" },
  1: { min: 1, max: 2, label: "Low", hex: "#0e4429", ansi: "\x1b[32m■\x1b[0m" },
  2: { min: 3, max: 5, label: "Medium", hex: "#006d32", ansi: "\x1b[92m■\x1b[0m" },
  3: { min: 6, max: 8, label: "High", hex: "#26a641", ansi: "\x1b[92;1m■\x1b[0m" },
  4: { min: 9, max: 12, label: "Max", hex: "#39d353", ansi: "\x1b[97;42m \x1b[0m" }
};

export const DAY_NAMES_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const DEFAULT_DATA_PATH = "./data.json";

export default {
  GRID_WEEKS,
  GRID_DAYS,
  INTENSITY_LEVELS,
  DAY_NAMES_SHORT,
  MONTH_NAMES_SHORT,
  DEFAULT_DATA_PATH
};
