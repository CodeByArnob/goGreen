/**
 * goGreen Missing-Day Contribution Gap Detector
 * Analyzes GitHub Contribution Graph (via GraphQL API or local Git history)
 * across the 53-week calendar window to identify inactive dates.
 */

import dayjs from "dayjs";
import { simpleGit } from "simple-git";
import { GRID_WEEKS, GRID_DAYS } from "./config.js";
import { getCalendarStartDate, coordinateToDate, generateEmptyGrid, gridToCommitPlan } from "./calendar.js";

/**
 * Retrieves available GitHub authentication token from environment or gh CLI.
 * @returns {Promise<string|null>}
 */
export async function getGitHubAuthToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();
  try {
    const { execFileSync } = await import("node:child_process");
    const token = execFileSync("gh", ["auth", "token"], { encoding: "utf8" });
    return token.trim();
  } catch (_) {
    return null;
  }
}

/**
 * Queries GitHub's official GraphQL API for user's actual contribution calendar.
 * @param {string} username - GitHub username (e.g. 'CodeByArnob')
 * @param {Object} [options]
 * @param {number} [options.year]
 * @param {string} [options.from]
 * @param {string} [options.to]
 * @returns {Promise<{ totalContributions: number, daysMap: Map<string, { count: number, level: string }>, weeks: Array }|null>}
 */
export async function fetchLiveGitHubContributions(username, options = {}) {
  const token = await getGitHubAuthToken();
  if (!token) {
    return null; // Gracefully fall back to local mode if not authenticated
  }

  let fromDate = options.from;
  let toDate = options.to;

  if (options.year) {
    fromDate = `${options.year}-01-01T00:00:00Z`;
    toDate = `${options.year}-12-31T23:59:59Z`;
  } else if (!fromDate || !toDate) {
    // Past 52 weeks
    const today = dayjs();
    toDate = today.toISOString();
    fromDate = today.subtract(52, "week").toISOString();
  }

  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "goGreen-Contribution-Auditor"
      },
      body: JSON.stringify({
        query,
        variables: {
          login: username,
          from: fromDate,
          to: toDate
        }
      })
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    if (payload.errors || !payload.data?.user?.contributionsCollection) {
      return null;
    }

    const calendar = payload.data.user.contributionsCollection.contributionCalendar;
    const daysMap = new Map();

    calendar.weeks.forEach(week => {
      week.contributionDays.forEach(day => {
        daysMap.set(day.date, {
          count: day.contributionCount,
          level: day.contributionLevel
        });
      });
    });

    return {
      totalContributions: calendar.totalContributions,
      daysMap,
      weeks: calendar.weeks
    };
  } catch (_) {
    return null;
  }
}

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
  } catch (_) {}

  return commitCounts;
}

/**
 * Scans the calendar window and detects dates with zero contributions.
 * Combines Live GitHub GraphQL API data (when available) with local repository fallback.
 *
 * @param {Object} [options]
 * @param {number} [options.year]
 * @param {string} [options.username="CodeByArnob"]
 * @param {string|Date} [options.endDate]
 * @param {string} [options.workingDir=process.cwd()]
 * @param {string} [options.authorEmail]
 * @param {boolean} [options.preferLive=true] - Attempt GitHub GraphQL fetch first
 * @param {Map<string, number>} [options.commitMap] - Optional precomputed date map
 * @param {number[][]} [options.existingGrid] - Optional pre-existing grid to find 0 cells
 * @returns {Promise<Object>}
 */
export async function detectContributionGaps(options = {}) {
  const startDate = getCalendarStartDate(options);
  const username = options.username || "CodeByArnob";
  const preferLive = options.preferLive !== false;

  let liveCalendar = null;
  let dataSource = "local-git";

  if (preferLive && !options.commitMap && !options.existingGrid) {
    liveCalendar = await fetchLiveGitHubContributions(username, {
      year: options.year
    });
    if (liveCalendar) {
      dataSource = "github-live-graphql";
    }
  }

  const commitMap = options.commitMap ||
    (options.existingGrid ? null : (liveCalendar ? null : await getLocalCommitHistory(options.workingDir, options.authorEmail)));

  const gapGrid = generateEmptyGrid(GRID_WEEKS, GRID_DAYS);
  const gaps = [];
  let activeDays = 0;
  let gapDays = 0;
  let totalContributions = liveCalendar ? liveCalendar.totalContributions : 0;

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
      } else if (liveCalendar) {
        const liveDay = liveCalendar.daysMap.get(dateStr);
        count = liveDay ? liveDay.count : 0;
      } else if (commitMap) {
        count = commitMap.get(dateStr) || 0;
      }

      if (!liveCalendar) {
        totalContributions += count;
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
    dataSource,
    year: options.year || "rolling-52-weeks",
    startDate: startDate.format("YYYY-MM-DD"),
    totalCalendarDays: activeDays + gapDays,
    totalContributions,
    activeDays,
    gapDays,
    percentActive: Math.round((activeDays / Math.max(1, activeDays + gapDays)) * 100),
    gaps,
    gapGrid
  };
}

/**
 * Scans multiple historical years and the current year.
 * @param {string} [username="CodeByArnob"]
 * @param {number[]} [years=[2023, 2024, 2025, 2026]]
 * @returns {Promise<Array>}
 */
export async function scanHistoricalYears(username = "CodeByArnob", years = [2023, 2024, 2025, 2026]) {
  const results = [];
  for (const year of years) {
    const report = await detectContributionGaps({
      username,
      year,
      preferLive: true
    });
    results.push(report);
  }
  return results;
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
