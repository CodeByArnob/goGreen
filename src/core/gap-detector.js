/**
 * goGreen Missing-Day Contribution Gap Detector
 * Analyzes Git commit history across the 53-week calendar window to identify inactive dates.
 */

import dayjs from "dayjs";
import { simpleGit } from "simple-git";
import { GRID_WEEKS, GRID_DAYS } from "./config.js";
import { getCalendarStartDate, coordinateToDate, dateToCoordinate, generateEmptyGrid, gridToCommitPlan } from "./calendar.js";

/**
 * Extracts local commit dates from Git history for a target author.
 * @param {string} [workingDir=process.cwd()]
 * @param {string} [authorEmail]
 * @returns {Promise<Map<string, number>>} Map of 'YYYY-MM-DD' -> commit count
 */
export async function getLocalCommitHistory(workingDir = process.cwd(), authorEmail = "") {
  const git = simpleGit(workingDir);
  const commitCounts = new Map();

  try {
    const args = ["log", "--format=%ad", "--date=format:%Y-%m-%d"];
    if (authorEmail) {
      args.push(`--author=${authorEmail}`);
    }
    const logOutput = await git.raw(args);
    const lines = logOutput.split("\n");

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        commitCounts.set(trimmed, (commitCounts.get(trimmed) || 0) + 1);
      }
    });
  } catch (_) {
    // If empty repo or error, return empty map
  }

  return commitCounts;
}

/**
 * Scans the calendar window and detects dates with zero contributions.
 * @param {Object} [options]
 * @param {number} [options.year]
 * @param {string|Date} [options.endDate]
 * @param {string} [options.workingDir=process.cwd()]
 * @param {string} [options.authorEmail]
 * @param {Map<string, number>} [options.commitMap] - Optional precomputed date map
 * @param {number[][]} [options.existingGrid] - Optional pre-existing grid to find 0 cells
 * @returns {Promise<Object>}
 */
export async function detectContributionGaps(options = {}) {
  const startDate = getCalendarStartDate(options);
  const commitMap = options.commitMap || (options.existingGrid ? null : await getLocalCommitHistory(options.workingDir, options.authorEmail));

  const gapGrid = generateEmptyGrid(GRID_WEEKS, GRID_DAYS);
  const gaps = [];
  let activeDays = 0;
  let gapDays = 0;

  const today = dayjs().endOf("day");

  for (let week = 0; week < GRID_WEEKS; week++) {
    for (let day = 0; day < GRID_DAYS; day++) {
      const cellDate = coordinateToDate(week, day, startDate);
      const dateStr = cellDate.format("YYYY-MM-DD");

      // Skip future dates (cannot be genuine past gaps)
      if (cellDate.isAfter(today)) {
        continue;
      }

      let count = 0;
      if (options.existingGrid) {
        count = options.existingGrid[day][week] || 0;
      } else if (commitMap) {
        count = commitMap.get(dateStr) || 0;
      }

      if (count === 0) {
        gapDays++;
        gaps.push({
          date: dateStr,
          week,
          day,
          dayName: cellDate.format("ddd")
        });
        gapGrid[day][week] = 1; // Mark gap
      } else {
        activeDays++;
      }
    }
  }

  return {
    startDate: startDate.format("YYYY-MM-DD"),
    totalCalendarDays: activeDays + gapDays,
    activeDays,
    gapDays,
    gaps,
    gapGrid
  };
}

/**
 * Generates an executable plan to fill identified gaps.
 * @param {Object} gapAnalysis - Output from detectContributionGaps
 * @param {Object} [options]
 * @param {number} [options.fillIntensity=1] - Level (1 to 4)
 * @param {number} [options.maxDaysToFill] - Optional cap on days to fill
 * @param {string[]} [options.daysOfWeek] - Filter by specific days (e.g. ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'])
 * @returns {Array}
 */
export function generateGapFillPlan(gapAnalysis, options = {}) {
  const intensity = Math.max(1, Math.min(4, options.fillIntensity || 1));
  const planGrid = generateEmptyGrid(GRID_WEEKS, GRID_DAYS);
  const dayFilter = options.daysOfWeek ? new Set(options.daysOfWeek.map(d => d.toLowerCase())) : null;

  let filledCount = 0;
  gapAnalysis.gaps.forEach(gap => {
    if (options.maxDaysToFill && filledCount >= options.maxDaysToFill) {
      return;
    }

    if (dayFilter && !dayFilter.has(gap.dayName.toLowerCase())) {
      return;
    }

    planGrid[gap.day][gap.week] = intensity;
    filledCount++;
  });

  const startDate = dayjs(gapAnalysis.startDate);
  return gridToCommitPlan(planGrid, { startDate });
}
