import test from "node:test";
import assert from "node:assert/strict";
import {
  generatePatternGrid,
  listAvailablePatterns,
  PRESET_PATTERNS
} from "../src/core/patterns.js";
import { GRID_WEEKS, GRID_DAYS } from "../src/core/config.js";

test("patterns: listAvailablePatterns returns all core patterns", () => {
  const patterns = listAvailablePatterns();
  assert.ok(patterns.includes("heart"));
  assert.ok(patterns.includes("space-invader"));
  assert.ok(patterns.includes("pacman"));
  assert.ok(patterns.includes("checkerboard"));
  assert.ok(patterns.includes("sine-wave"));
  assert.ok(patterns.includes("random-realistic"));
});

test("patterns: generatePatternGrid creates valid 7x53 grid for preset patterns", () => {
  const patternsToTest = ["heart", "space-invader", "ghost", "pacman", "smiley", "checkerboard", "stripes", "full-green"];

  for (const name of patternsToTest) {
    const grid = generatePatternGrid(name, { intensity: 3 });
    assert.equal(grid.length, GRID_DAYS, `Pattern ${name} must have 7 rows`);
    assert.equal(grid[0].length, GRID_WEEKS, `Pattern ${name} must have 53 columns`);

    const hasFilled = grid.flat().some(cell => cell === 3);
    assert.ok(hasFilled, `Pattern ${name} must have cells filled with intensity 3`);
  }
});

test("patterns: realistic pattern produces expected activity range", () => {
  const targetDays = 120;
  const grid = generatePatternGrid("realistic", { targetDays });

  assert.equal(grid.length, GRID_DAYS);
  assert.equal(grid[0].length, GRID_WEEKS);

  const activeDays = grid.flat().filter(cell => cell > 0).length;
  // Should be in reasonable ballpark of targetDays
  assert.ok(activeDays > 50 && activeDays <= targetDays + 50, `Active days (${activeDays}) should be near ${targetDays}`);
});

test("patterns: unknown pattern throws descriptive error", () => {
  assert.throws(() => generatePatternGrid("nonexistent-pattern-xyz"), /Unknown pattern/);
});
