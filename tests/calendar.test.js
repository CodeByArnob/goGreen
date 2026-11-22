import test from "node:test";
import assert from "node:assert/strict";
import dayjs from "dayjs";
import {
  getCalendarStartDate,
  coordinateToDate,
  dateToCoordinate,
  generateEmptyGrid,
  levelToCommitCount,
  gridToCommitPlan,
  summarizePlan
} from "../src/core/calendar.js";
import { GRID_WEEKS, GRID_DAYS } from "../src/core/config.js";

test("calendar: getCalendarStartDate anchors to Sunday", () => {
  const startRolling = getCalendarStartDate();
  assert.equal(startRolling.day(), 0, "Rolling start date must be a Sunday");

  const start2023 = getCalendarStartDate({ year: 2023 });
  assert.equal(start2023.day(), 0, "Year-anchored start date must be a Sunday");
  assert.ok(start2023.year() <= 2023, "Start date must be on or before Jan 1, 2023");
});

test("calendar: coordinateToDate and dateToCoordinate roundtrip", () => {
  const startDate = dayjs("2024-01-07"); // Known Sunday
  const date = coordinateToDate(10, 3, startDate); // Week 10, Wednesday

  assert.equal(date.diff(startDate, "day"), 10 * 7 + 3);

  const coord = dateToCoordinate(date, startDate);
  assert.equal(coord.week, 10);
  assert.equal(coord.day, 3);
  assert.equal(coord.inBounds, true);
});

test("calendar: coordinateToDate out of bounds throws error", () => {
  const startDate = dayjs("2024-01-07");
  assert.throws(() => coordinateToDate(GRID_WEEKS, 0, startDate), /Week index out of bounds/);
  assert.throws(() => coordinateToDate(0, GRID_DAYS, startDate), /Day index out of bounds/);
});

test("calendar: generateEmptyGrid generates 7 rows by 53 columns", () => {
  const grid = generateEmptyGrid();
  assert.equal(grid.length, 7, "Grid must have 7 rows (days)");
  assert.equal(grid[0].length, 53, "Grid must have 53 columns (weeks)");
  assert.ok(grid.every(row => row.every(cell => cell === 0)), "All cells must initialize to 0");
});

test("calendar: levelToCommitCount maps accurately", () => {
  assert.equal(levelToCommitCount(0), 0);
  assert.equal(levelToCommitCount(1), 1);
  assert.equal(levelToCommitCount(2), 4);
  assert.equal(levelToCommitCount(3), 7);
  assert.equal(levelToCommitCount(4), 10);
});

test("calendar: gridToCommitPlan and summarizePlan compute accurate counts", () => {
  const grid = generateEmptyGrid();
  grid[0][0] = 1; // 1 commit
  grid[1][5] = 4; // 10 commits
  grid[6][52] = 2; // 4 commits

  const startDate = dayjs("2024-01-07");
  const plan = gridToCommitPlan(grid, { startDate });

  assert.equal(plan.length, 3, "Plan must contain 3 active days");

  const summary = summarizePlan(plan);
  assert.equal(summary.activeDays, 3);
  assert.equal(summary.totalCommits, 1 + 10 + 4);
  assert.equal(summary.levelCounts[1], 1);
  assert.equal(summary.levelCounts[4], 1);
  assert.equal(summary.levelCounts[2], 1);
});
