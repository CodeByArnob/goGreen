/**
 * goGreen Calendar & Coordinate Utilities
 * Maps between GitHub 53-week x 7-day contribution grid and ISO calendar dates.
 */

import dayjs from "dayjs";
import { GRID_WEEKS, GRID_DAYS, INTENSITY_LEVELS } from "./config.js";

/**
 * Calculates the start date (Sunday of week 0) for the contribution grid.
 * @param {Object} [options]
 * @param {number} [options.year] - Specific calendar year (e.g. 2023, 2024)
 * @param {string|Date} [options.endDate] - End date to anchor the 52-week window
 * @returns {dayjs.Dayjs} The start date (Sunday) of week 0
 */
export function getCalendarStartDate(options = {}) {
  if (options.year) {
    const jan1 = dayjs(`${options.year}-01-01`);
    // Find the Sunday on or before Jan 1
    const dayOfWeek = jan1.day(); // 0 is Sunday
    return jan1.subtract(dayOfWeek, "day").startOf("day");
  }

  const end = options.endDate ? dayjs(options.endDate) : dayjs();
  // Find Sunday of the week containing the end date
  const currentSunday = end.subtract(end.day(), "day").startOf("day");
  // 52 weeks back gives week 0 Sunday
  return currentSunday.subtract(GRID_WEEKS - 1, "week").startOf("day");
}

/**
 * Converts a (week, day) coordinate to a dayjs Date.
 * @param {number} week - 0 to 52
 * @param {number} day - 0 (Sunday) to 6 (Saturday)
 * @param {dayjs.Dayjs} startDate - Anchor Sunday
 * @returns {dayjs.Dayjs}
 */
export function coordinateToDate(week, day, startDate) {
  if (week < 0 || week >= GRID_WEEKS) {
    throw new Error(`Week index out of bounds (0-${GRID_WEEKS - 1}): ${week}`);
  }
  if (day < 0 || day >= GRID_DAYS) {
    throw new Error(`Day index out of bounds (0-${GRID_DAYS - 1}): ${day}`);
  }
  return startDate.add(week, "week").add(day, "day");
}

/**
 * Converts a date to (week, day) coordinates relative to startDate.
 * @param {string|Date|dayjs.Dayjs} date
 * @param {dayjs.Dayjs} startDate
 * @returns {{ week: number, day: number, inBounds: boolean }}
 */
export function dateToCoordinate(date, startDate) {
  const target = dayjs(date).startOf("day");
  const diffDays = target.diff(startDate.startOf("day"), "day");
  const week = Math.floor(diffDays / 7);
  const day = (diffDays % 7 + 7) % 7;
  const inBounds = week >= 0 && week < GRID_WEEKS;
  return { week, day, inBounds };
}

/**
 * Generates an empty 7x53 grid (7 rows: Sun..Sat, 53 columns: weeks)
 * @param {number} [weeks=GRID_WEEKS]
 * @param {number} [days=GRID_DAYS]
 * @returns {number[][]}
 */
export function generateEmptyGrid(weeks = GRID_WEEKS, days = GRID_DAYS) {
  return Array.from({ length: days }, () => Array(weeks).fill(0));
}

/**
 * Clones a 2D grid
 * @param {number[][]} grid
 * @returns {number[][]}
 */
export function cloneGrid(grid) {
  return grid.map(row => [...row]);
}

/**
 * Resolves intensity level (0..4) into commit count.
 * @param {number} level
 * @param {Object} [options]
 * @param {boolean} [options.randomize=false] - Pick random count within the level's range
 * @returns {number}
 */
export function levelToCommitCount(level, options = {}) {
  const norm = Math.max(0, Math.min(4, Math.round(level)));
  const config = INTENSITY_LEVELS[norm] || INTENSITY_LEVELS[0];
  if (config.max === 0) return 0;
  if (options.randomize && config.min !== config.max) {
    return Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
  }
  // Deterministic middle or standard count:
  const counts = [0, 1, 4, 7, 10];
  return counts[norm];
}

/**
 * Transforms a 7x53 grid into an executable list of planned commits.
 * @param {number[][]} grid - 7 rows (days 0..6) x 53 columns (weeks 0..52)
 * @param {Object} [options]
 * @param {dayjs.Dayjs} [options.startDate]
 * @param {number} [options.year]
 * @param {boolean} [options.randomizeCount=false]
 * @returns {Array<{ date: string, formattedDate: string, week: number, day: number, level: number, commitCount: number }>}
 */
export function gridToCommitPlan(grid, options = {}) {
  const startDate = options.startDate || getCalendarStartDate(options);
  const plan = [];

  for (let week = 0; week < GRID_WEEKS; week++) {
    for (let day = 0; day < GRID_DAYS; day++) {
      const level = (grid[day] && grid[day][week]) || 0;
      if (level > 0) {
        const commitCount = levelToCommitCount(level, { randomize: options.randomizeCount });
        if (commitCount > 0) {
          const targetDate = coordinateToDate(week, day, startDate);
          plan.push({
            date: targetDate.format("YYYY-MM-DD"),
            formattedDate: targetDate.toISOString(),
            week,
            day,
            level,
            commitCount
          });
        }
      }
    }
  }

  return plan;
}

/**
 * Computes plan summary stats
 * @param {Array} plan
 * @returns {Object}
 */
export function summarizePlan(plan) {
  const totalCommits = plan.reduce((sum, item) => sum + item.commitCount, 0);
  const activeDays = plan.length;
  const levelCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };
  plan.forEach(item => {
    if (levelCounts[item.level] !== undefined) {
      levelCounts[item.level]++;
    }
  });

  return {
    totalCommits,
    activeDays,
    levelCounts,
    firstDate: plan.length > 0 ? plan[0].date : null,
    lastDate: plan.length > 0 ? plan[plan.length - 1].date : null
  };
}
