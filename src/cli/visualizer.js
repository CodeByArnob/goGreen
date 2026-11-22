/**
 * goGreen Terminal Contribution Grid Visualizer
 * Renders an ANSI-colored 53-week x 7-day contribution grid directly in the terminal.
 */

import chalk from "chalk";
import { GRID_WEEKS, GRID_DAYS, DAY_NAMES_SHORT, MONTH_NAMES_SHORT } from "../core/config.js";
import { coordinateToDate, summarizePlan } from "../core/calendar.js";

/**
 * Returns colored ANSI string for a contribution level (0..4).
 * @param {number} level
 * @returns {string}
 */
export function formatCell(level) {
  switch (level) {
    case 1:
      return chalk.hex("#0e4429")("■"); // Level 1: Dark green
    case 2:
      return chalk.hex("#006d32")("■"); // Level 2: Medium green
    case 3:
      return chalk.hex("#26a641")("■"); // Level 3: Bright green
    case 4:
      return chalk.hex("#39d353")("■"); // Level 4: Vibrant light green
    case 0:
    default:
      return chalk.hex("#2d333b")("■"); // Level 0: Inactive cell
  }
}

/**
 * Generates month header string aligned above the 53 week columns.
 * @param {dayjs.Dayjs} startDate
 * @returns {string}
 */
function buildMonthHeader(startDate) {
  let header = "    "; // 4 spaces for day label margin
  let lastMonth = -1;

  for (let w = 0; w < GRID_WEEKS; w++) {
    const colDate = coordinateToDate(w, 0, startDate);
    const month = colDate.month(); // 0..11
    if (month !== lastMonth && (w === 0 || colDate.date() <= 7)) {
      const monthStr = MONTH_NAMES_SHORT[month];
      header += chalk.dim(monthStr.slice(0, 3));
      // Pad spaces until next column
      const skip = monthStr.slice(0, 3).length;
      w += Math.max(0, Math.floor(skip / 2));
      lastMonth = month;
    } else {
      header += "  ";
    }
  }
  return header;
}

/**
 * Renders the full 53x7 grid to terminal string.
 * @param {number[][]} grid
 * @param {Object} [options]
 * @param {dayjs.Dayjs} options.startDate
 * @returns {string}
 */
export function renderGrid(grid, options = {}) {
  const lines = [];
  const startDate = options.startDate;

  if (startDate) {
    lines.push(buildMonthHeader(startDate));
  }

  for (let day = 0; day < GRID_DAYS; day++) {
    const dayLabel = chalk.dim(DAY_NAMES_SHORT[day]);
    let rowCells = "";
    for (let week = 0; week < GRID_WEEKS; week++) {
      const level = (grid[day] && grid[day][week]) || 0;
      rowCells += formatCell(level) + " ";
    }
    lines.push(`${dayLabel} ${rowCells}`);
  }

  // Legend
  const legend = [
    chalk.dim("    Less "),
    formatCell(0), " ",
    formatCell(1), " ",
    formatCell(2), " ",
    formatCell(3), " ",
    formatCell(4),
    chalk.dim(" More")
  ].join("");

  lines.push("");
  lines.push(legend);

  return lines.join("\n");
}

/**
 * Prints a summary badge / box of planned commits.
 * @param {Array} plan
 * @param {Object} [meta]
 */
export function printPlanSummary(plan, meta = {}) {
  const stats = summarizePlan(plan);

  console.log(chalk.bold("\n📊 Plan Summary:"));
  console.log(`  ${chalk.cyan("• Total Commits:")}   ${chalk.bold.green(stats.totalCommits)}`);
  console.log(`  ${chalk.cyan("• Active Days:")}     ${chalk.bold.yellow(stats.activeDays)} / ${GRID_WEEKS * GRID_DAYS}`);
  if (stats.firstDate && stats.lastDate) {
    console.log(`  ${chalk.cyan("• Date Span:")}       ${stats.firstDate} → ${stats.lastDate}`);
  }
  console.log(`  ${chalk.cyan("• Intensity Dist:")}   L1: ${stats.levelCounts[1]} | L2: ${stats.levelCounts[2]} | L3: ${stats.levelCounts[3]} | L4: ${stats.levelCounts[4]}`);
  if (meta.dryRun) {
    console.log(chalk.yellowBright("\n  ⚡ Mode: DRY-RUN (No Git history or remote will be altered)"));
  }
  console.log("");
}
