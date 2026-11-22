/**
 * goGreen 5x7 Pixel Font & Text Matrix Engine
 * Converts text into 7-row binary/intensity matrices for GitHub contribution grids.
 */

import { GRID_WEEKS, GRID_DAYS } from "./config.js";
import { generateEmptyGrid } from "./calendar.js";

/**
 * 5x7 Bitmap Font Dictionary.
 * Each entry is an array of 7 strings (each row length matches character width).
 * '1' = filled pixel, '0' or ' ' = empty.
 */
export const FONT_5X7 = {
  " ": [
    "   ",
    "   ",
    "   ",
    "   ",
    "   ",
    "   ",
    "   "
  ],
  "A": [
    " 111 ",
    "1   1",
    "1   1",
    "11111",
    "1   1",
    "1   1",
    "1   1"
  ],
  "B": [
    "1111 ",
    "1   1",
    "1   1",
    "1111 ",
    "1   1",
    "1   1",
    "1111 "
  ],
  "C": [
    " 1111",
    "1    ",
    "1    ",
    "1    ",
    "1    ",
    "1    ",
    " 1111"
  ],
  "D": [
    "1111 ",
    "1   1",
    "1   1",
    "1   1",
    "1   1",
    "1   1",
    "1111 "
  ],
  "E": [
    "11111",
    "1    ",
    "1    ",
    "1111 ",
    "1    ",
    "1    ",
    "11111"
  ],
  "F": [
    "11111",
    "1    ",
    "1    ",
    "1111 ",
    "1    ",
    "1    ",
    "1    "
  ],
  "G": [
    " 1111",
    "1    ",
    "1    ",
    "1 111",
    "1   1",
    "1   1",
    " 1111"
  ],
  "H": [
    "1   1",
    "1   1",
    "1   1",
    "11111",
    "1   1",
    "1   1",
    "1   1"
  ],
  "I": [
    "111",
    " 1 ",
    " 1 ",
    " 1 ",
    " 1 ",
    " 1 ",
    "111"
  ],
  "J": [
    "  111",
    "    1",
    "    1",
    "    1",
    "1   1",
    "1   1",
    " 111 "
  ],
  "K": [
    "1   1",
    "1  1 ",
    "1 1  ",
    "11   ",
    "1 1  ",
    "1  1 ",
    "1   1"
  ],
  "L": [
    "1    ",
    "1    ",
    "1    ",
    "1    ",
    "1    ",
    "1    ",
    "11111"
  ],
  "M": [
    "1   1",
    "11 11",
    "1 1 1",
    "1 1 1",
    "1   1",
    "1   1",
    "1   1"
  ],
  "N": [
    "1   1",
    "11  1",
    "1 1 1",
    "1 1 1",
    "1  11",
    "1   1",
    "1   1"
  ],
  "O": [
    " 111 ",
    "1   1",
    "1   1",
    "1   1",
    "1   1",
    "1   1",
    " 111 "
  ],
  "P": [
    "1111 ",
    "1   1",
    "1   1",
    "1111 ",
    "1    ",
    "1    ",
    "1    "
  ],
  "Q": [
    " 111 ",
    "1   1",
    "1   1",
    "1   1",
    "1 1 1",
    "1  1 ",
    " 11 1"
  ],
  "R": [
    "1111 ",
    "1   1",
    "1   1",
    "1111 ",
    "1 1  ",
    "1  1 ",
    "1   1"
  ],
  "S": [
    " 1111",
    "1    ",
    "1    ",
    " 111 ",
    "    1",
    "    1",
    "1111 "
  ],
  "T": [
    "11111",
    "  1  ",
    "  1  ",
    "  1  ",
    "  1  ",
    "  1  ",
    "  1  "
  ],
  "U": [
    "1   1",
    "1   1",
    "1   1",
    "1   1",
    "1   1",
    "1   1",
    " 111 "
  ],
  "V": [
    "1   1",
    "1   1",
    "1   1",
    "1   1",
    " 1 1 ",
    " 1 1 ",
    "  1  "
  ],
  "W": [
    "1   1",
    "1   1",
    "1   1",
    "1 1 1",
    "1 1 1",
    "11 11",
    "1   1"
  ],
  "X": [
    "1   1",
    " 1 1 ",
    "  1  ",
    "  1  ",
    "  1  ",
    " 1 1 ",
    "1   1"
  ],
  "Y": [
    "1   1",
    "1   1",
    " 1 1 ",
    "  1  ",
    "  1  ",
    "  1  ",
    "  1  "
  ],
  "Z": [
    "11111",
    "    1",
    "   1 ",
    "  1  ",
    " 1   ",
    "1    ",
    "11111"
  ],
  "0": [
    " 111 ",
    "1  11",
    "1 1 1",
    "1 1 1",
    "11  1",
    "1   1",
    " 111 "
  ],
  "1": [
    " 11 ",
    "  1 ",
    "  1 ",
    "  1 ",
    "  1 ",
    "  1 ",
    "1111"
  ],
  "2": [
    " 111 ",
    "1   1",
    "    1",
    "  11 ",
    " 1   ",
    "1    ",
    "11111"
  ],
  "3": [
    "1111 ",
    "    1",
    "    1",
    " 111 ",
    "    1",
    "    1",
    "1111 "
  ],
  "4": [
    "1  1 ",
    "1  1 ",
    "1  1 ",
    "11111",
    "   1 ",
    "   1 ",
    "   1 "
  ],
  "5": [
    "11111",
    "1    ",
    "1111 ",
    "    1",
    "    1",
    "1   1",
    " 111 "
  ],
  "6": [
    " 111 ",
    "1    ",
    "1    ",
    "1111 ",
    "1   1",
    "1   1",
    " 111 "
  ],
  "7": [
    "11111",
    "    1",
    "   1 ",
    "  1  ",
    " 1   ",
    " 1   ",
    " 1   "
  ],
  "8": [
    " 111 ",
    "1   1",
    "1   1",
    " 111 ",
    "1   1",
    "1   1",
    " 111 "
  ],
  "9": [
    " 111 ",
    "1   1",
    "1   1",
    " 1111",
    "    1",
    "    1",
    " 111 "
  ],
  "!": [
    "1",
    "1",
    "1",
    "1",
    "1",
    " ",
    "1"
  ],
  "?": [
    " 111 ",
    "1   1",
    "    1",
    "  11 ",
    "  1  ",
    "     ",
    "  1  "
  ],
  "-": [
    "   ",
    "   ",
    "   ",
    "111",
    "   ",
    "   ",
    "   "
  ],
  "+": [
    "     ",
    "  1  ",
    "  1  ",
    "11111",
    "  1  ",
    "  1  ",
    "     "
  ],
  ".": [
    " ",
    " ",
    " ",
    " ",
    " ",
    " ",
    "1"
  ],
  ":": [
    " ",
    "1",
    " ",
    " ",
    " ",
    "1",
    " "
  ],
  "<3": [
    " 1 1 ",
    "1 1 1",
    "11111",
    "11111",
    " 111 ",
    "  1  ",
    "     "
  ],
  "HEART": [
    " 1 1 ",
    "1 1 1",
    "11111",
    "11111",
    " 111 ",
    "  1  ",
    "     "
  ]
};

/**
 * Gets glyph representation for a character
 * @param {string} char
 * @returns {string[]}
 */
export function getGlyph(char) {
  const upper = char.toUpperCase();
  if (FONT_5X7[upper]) {
    return FONT_5X7[upper];
  }
  // Fallback to space for unsupported chars
  return FONT_5X7[" "];
}

/**
 * Measures total width in columns for a string of text.
 * @param {string} text
 * @param {number} [spacing=1]
 * @returns {number}
 */
export function measureTextWidth(text, spacing = 1) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const glyph = getGlyph(text[i]);
    const charWidth = glyph[0].length;
    width += charWidth;
    if (i < text.length - 1) {
      width += spacing;
    }
  }
  return width;
}

/**
 * Converts a text string into a 7x53 contribution grid.
 * @param {string} text
 * @param {Object} [options]
 * @param {number} [options.intensity=4] - 1 to 4
 * @param {number} [options.startWeek=1] - Starting week if not autoCentered
 * @param {number} [options.spacing=1] - Gap between characters
 * @param {boolean} [options.autoCenter=true] - Center text automatically horizontally
 * @returns {number[][]} 7 rows x 53 columns
 */
export function textToGrid(text, options = {}) {
  const intensity = Math.max(1, Math.min(4, options.intensity ?? 4));
  const spacing = options.spacing ?? 1;
  const grid = generateEmptyGrid(GRID_WEEKS, GRID_DAYS);

  const totalWidth = measureTextWidth(text, spacing);

  let currentWeek = options.startWeek ?? 1;
  if (options.autoCenter !== false) {
    currentWeek = Math.max(0, Math.floor((GRID_WEEKS - totalWidth) / 2));
  }

  for (let i = 0; i < text.length; i++) {
    const glyph = getGlyph(text[i]);
    const charWidth = glyph[0].length;

    for (let row = 0; row < GRID_DAYS; row++) {
      for (let col = 0; col < charWidth; col++) {
        const targetWeek = currentWeek + col;
        if (targetWeek >= 0 && targetWeek < GRID_WEEKS) {
          if (glyph[row] && glyph[row][col] === "1") {
            grid[row][targetWeek] = intensity;
          }
        }
      }
    }

    currentWeek += charWidth + spacing;
    if (currentWeek >= GRID_WEEKS) break;
  }

  return grid;
}
