/**
 * goGreen - Public API
 */

export * from "./core/config.js";
export * from "./core/calendar.js";
export * from "./core/font.js";
export * from "./core/patterns.js";
export * from "./core/git-engine.js";
export * from "./core/eligibility.js";
export * from "./core/gap-detector.js";
export * from "./core/commit-reviewer.js";
export * from "./cli/visualizer.js";
export * from "./web/server.js";

import { textToGrid } from "./core/font.js";
import { generatePatternGrid } from "./core/patterns.js";
import { getCalendarStartDate, gridToCommitPlan, summarizePlan } from "./core/calendar.js";
import { executeCommitPlan } from "./core/git-engine.js";

/**
 * High-level programmatic API for generating contributions.
 * @param {Object} options
 * @param {"text"|"pattern"|"realistic"|"grid"} [options.mode="text"]
 * @param {string} [options.text="GO"]
 * @param {string} [options.pattern="heart"]
 * @param {number} [options.targetDays=160]
 * @param {number[][]} [options.grid]
 * @param {number} [options.intensity=4]
 * @param {number} [options.year]
 * @param {boolean} [options.dryRun=true]
 * @param {boolean} [options.push=false]
 * @param {string} [options.branch]
 * @returns {Promise<Object>}
 */
export async function generateContributions(options = {}) {
  let grid;
  const mode = options.mode || "text";

  if (mode === "grid" && options.grid) {
    grid = options.grid;
  } else if (mode === "pattern") {
    grid = generatePatternGrid(options.pattern || "heart", {
      intensity: options.intensity || 4
    });
  } else if (mode === "realistic") {
    grid = generatePatternGrid("realistic", {
      targetDays: options.targetDays || 160
    });
  } else {
    grid = textToGrid(options.text || "GO", {
      intensity: options.intensity || 4,
      autoCenter: options.autoCenter !== false
    });
  }

  const startDate = getCalendarStartDate({ year: options.year });
  const plan = gridToCommitPlan(grid, { startDate });

  return executeCommitPlan(plan, {
    dryRun: options.dryRun !== false, // Safe default: true
    push: Boolean(options.push),
    branch: options.branch
  });
}

export default {
  generateContributions
};
