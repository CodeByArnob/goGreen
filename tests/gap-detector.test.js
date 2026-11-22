import test from "node:test";
import assert from "node:assert/strict";
import {
  detectContributionGaps,
  generateGapFillPlan
} from "../src/core/gap-detector.js";
import { generateEmptyGrid } from "../src/core/calendar.js";
import { GRID_WEEKS, GRID_DAYS } from "../src/core/config.js";

test("gap-detector: detectContributionGaps flags 0-activity days accurately", async () => {
  const grid = generateEmptyGrid(GRID_WEEKS, GRID_DAYS);
  // Mark 2 cells as active
  grid[0][0] = 3;
  grid[1][1] = 2;

  const gapsData = await detectContributionGaps({
    year: 2024,
    existingGrid: grid
  });

  assert.equal(gapsData.activeDays, 2);
  assert.ok(gapsData.gapDays > 0);
  assert.equal(gapsData.totalCalendarDays, gapsData.activeDays + gapsData.gapDays);
  assert.ok(Array.isArray(gapsData.gaps));
});

test("gap-detector: generateGapFillPlan produces commits only for gap days", async () => {
  const grid = generateEmptyGrid(GRID_WEEKS, GRID_DAYS);
  grid[0][0] = 4; // Existing active cell

  const gapsData = await detectContributionGaps({
    year: 2024,
    existingGrid: grid
  });

  const plan = generateGapFillPlan(gapsData, { fillIntensity: 2, maxDaysToFill: 5 });

  assert.equal(plan.length, 5, "Should cap plan to requested maxDaysToFill");
  assert.ok(plan.every(item => item.level === 2), "Every fill item should have requested intensity");
  // Cell (week 0, day 0) was already active and must NOT be in the gap plan
  assert.ok(!plan.some(item => item.week === 0 && item.day === 0));
});
