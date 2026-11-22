import test from "node:test";
import assert from "node:assert/strict";
import { getGlyph, measureTextWidth, textToGrid, FONT_5X7 } from "../src/core/font.js";
import { GRID_WEEKS, GRID_DAYS } from "../src/core/config.js";

test("font: getGlyph returns valid 7-row matrix for known and fallback characters", () => {
  const glyphA = getGlyph("A");
  assert.equal(glyphA.length, 7, "Glyph must be 7 rows tall");
  assert.ok(glyphA[0].length >= 3, "Glyph row must have non-zero width");

  // Lowercase fallback to uppercase
  const glyphLowerA = getGlyph("a");
  assert.deepEqual(glyphLowerA, glyphA);

  // Unknown character fallback
  const glyphUnknown = getGlyph("~");
  assert.deepEqual(glyphUnknown, FONT_5X7[" "]);
});

test("font: measureTextWidth calculates accurate width including spacing", () => {
  const widthH = getGlyph("H")[0].length;
  const widthI = getGlyph("I")[0].length;
  const spacing = 2;

  const total = measureTextWidth("HI", spacing);
  assert.equal(total, widthH + widthI + spacing);
});

test("font: textToGrid produces valid 7x53 grid with auto-centering", () => {
  const grid = textToGrid("HI", { intensity: 4, autoCenter: true });

  assert.equal(grid.length, GRID_DAYS);
  assert.equal(grid[0].length, GRID_WEEKS);

  // Check that some cells are filled with intensity 4
  const filledCells = grid.flat().filter(cell => cell === 4);
  assert.ok(filledCells.length > 0, "Grid must contain filled cells");

  // Check bounds: no cell exceeds intensity 4 or is negative
  assert.ok(grid.flat().every(cell => cell >= 0 && cell <= 4));
});

test("font: textToGrid respects custom intensity and manual start week", () => {
  const grid = textToGrid("A", { intensity: 2, autoCenter: false, startWeek: 5 });
  // Column 5 should contain elements with intensity 2
  const col5 = grid.map(row => row[5]);
  assert.ok(col5.some(val => val === 2), "Column 5 should have intensity 2 cells");
  // Before column 5 should be empty
  for (let w = 0; w < 5; w++) {
    for (let r = 0; r < GRID_DAYS; r++) {
      assert.equal(grid[r][w], 0);
    }
  }
});
