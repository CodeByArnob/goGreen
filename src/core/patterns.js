/**
 * goGreen Preset Pixel Art & Pattern Generators
 * Creative visual patterns designed specifically for the 7x53 contribution grid.
 */

import { GRID_WEEKS, GRID_DAYS } from "./config.js";
import { generateEmptyGrid } from "./calendar.js";

export const PRESET_PATTERNS = {
  "heart": {
    name: "Pixel Heart",
    description: "A cute centered 7x7 pixel heart",
    height: 7,
    width: 7,
    matrix: [
      " 11 11 ",
      "1111111",
      "1111111",
      " 11111 ",
      "  111  ",
      "   1   ",
      "       "
    ]
  },
  "space-invader": {
    name: "Space Invader",
    description: "Classic 8-bit arcade alien sprite",
    height: 7,
    width: 11,
    matrix: [
      "  1     1  ",
      "   1   1   ",
      "  1111111  ",
      " 11 111 11 ",
      "11111111111",
      "1 1     1 1",
      "   11 11   "
    ]
  },
  "ghost": {
    name: "Arcade Ghost",
    description: "Retro arcade ghost sprite",
    height: 7,
    width: 7,
    matrix: [
      " 11111 ",
      "1 1 1 1",
      "1111111",
      "1111111",
      "1111111",
      "1111111",
      "1 1 1 1"
    ]
  },
  "pacman": {
    name: "Pacman & Ghost",
    description: "Pacman chasing food and escaping a ghost",
    height: 7,
    width: 25,
    matrix: [
      "  1111       1111        ",
      " 111111     1 1 1 1      ",
      "11111        111111  1  1",
      "11111        111111      ",
      "111111       111111  1  1",
      " 111111     1111111      ",
      "  1111      1 1 1 1      "
    ]
  },
  "smiley": {
    name: "Smiley Face",
    description: "Happy pixel face",
    height: 7,
    width: 7,
    matrix: [
      " 11111 ",
      "1     1",
      "1 1 1 1",
      "1     1",
      "1 1 1 1",
      "1  11 1",
      " 11111 "
    ]
  }
};

/**
 * Places a 2D matrix into a 7x53 grid at (startRow, startCol).
 * @param {number[][]} targetGrid
 * @param {string[]} matrix
 * @param {number} startCol
 * @param {number} [intensity=4]
 */
function stampMatrix(targetGrid, matrix, startCol, intensity = 4) {
  for (let r = 0; r < matrix.length && r < GRID_DAYS; r++) {
    const rowStr = matrix[r];
    for (let c = 0; c < rowStr.length; c++) {
      const col = startCol + c;
      if (col >= 0 && col < GRID_WEEKS) {
        if (rowStr[c] === "1") {
          targetGrid[r][col] = intensity;
        }
      }
    }
  }
}

/**
 * Generates a pattern grid by name.
 * @param {string} patternName
 * @param {Object} [options]
 * @param {number} [options.intensity=4]
 * @param {number} [options.count=100] (for random/realistic)
 * @returns {number[][]}
 */
export function generatePatternGrid(patternName, options = {}) {
  const intensity = Math.max(1, Math.min(4, options.intensity ?? 4));
  const grid = generateEmptyGrid(GRID_WEEKS, GRID_DAYS);

  const key = (patternName || "").toLowerCase().trim();

  if (PRESET_PATTERNS[key]) {
    const preset = PRESET_PATTERNS[key];
    const startCol = Math.max(0, Math.floor((GRID_WEEKS - preset.width) / 2));
    stampMatrix(grid, preset.matrix, startCol, intensity);
    return grid;
  }

  switch (key) {
    case "hearts": {
      // Repeat hearts every 10 columns
      for (let c = 2; c < GRID_WEEKS - 7; c += 10) {
        stampMatrix(grid, PRESET_PATTERNS.heart.matrix, c, intensity);
      }
      return grid;
    }

    case "sine-wave": {
      // Mathematical wave with variable gradient intensity
      for (let w = 0; w < GRID_WEEKS; w++) {
        // Sine gives range -1 to 1; map to 0 to 6
        const wave = Math.sin((w / GRID_WEEKS) * Math.PI * 4); // 2 full cycles
        const centerRow = Math.round(3 + wave * 2.5);
        const row = Math.max(0, Math.min(6, centerRow));
        grid[row][w] = intensity;
        // Add a soft trail
        if (row > 0 && Math.random() > 0.4) grid[row - 1][w] = Math.max(1, intensity - 1);
        if (row < 6 && Math.random() > 0.4) grid[row + 1][w] = Math.max(1, intensity - 1);
      }
      return grid;
    }

    case "checkerboard": {
      for (let w = 0; w < GRID_WEEKS; w++) {
        for (let d = 0; d < GRID_DAYS; d++) {
          if ((w + d) % 2 === 0) {
            grid[d][w] = intensity;
          }
        }
      }
      return grid;
    }

    case "stripes": {
      for (let w = 0; w < GRID_WEEKS; w++) {
        if (w % 2 === 0) {
          for (let d = 0; d < GRID_DAYS; d++) {
            grid[d][w] = intensity;
          }
        }
      }
      return grid;
    }

    case "full":
    case "full-green": {
      for (let w = 0; w < GRID_WEEKS; w++) {
        for (let d = 0; d < GRID_DAYS; d++) {
          grid[d][w] = intensity;
        }
      }
      return grid;
    }

    case "random":
    case "realistic":
    case "random-realistic": {
      // Realistic simulation of human developer activity
      // Higher activity on Tue/Wed/Thu, lower Mon/Fri, very low Sat/Sun
      // Occasional vacation weeks with zero commits
      const totalDays = GRID_WEEKS * GRID_DAYS;
      const targetActiveDays = Math.min(totalDays, options.targetDays || 180);

      const dayWeights = [0.15, 0.75, 0.95, 0.95, 0.90, 0.70, 0.20]; // Sun..Sat

      let activeCount = 0;
      // Loop over calendar weeks
      for (let w = 0; w < GRID_WEEKS; w++) {
        // 5% chance of vacation week
        const isVacationWeek = Math.random() < 0.05;
        if (isVacationWeek) continue;

        for (let d = 0; d < GRID_DAYS; d++) {
          const baseProb = dayWeights[d] * 0.7;
          if (Math.random() < baseProb && activeCount < targetActiveDays) {
            // Pick a realistic intensity (mostly 1-2, occasional 3-4 bursts)
            const roll = Math.random();
            let dayIntensity = 1;
            if (roll > 0.85) dayIntensity = 4;
            else if (roll > 0.65) dayIntensity = 3;
            else if (roll > 0.35) dayIntensity = 2;

            grid[d][w] = dayIntensity;
            activeCount++;
          }
        }
      }
      return grid;
    }

    default:
      throw new Error(`Unknown pattern "${patternName}". Available patterns: ${listAvailablePatterns().join(", ")}`);
  }
}

/**
 * Returns names of all available preset patterns
 * @returns {string[]}
 */
export function listAvailablePatterns() {
  return [
    ...Object.keys(PRESET_PATTERNS),
    "hearts",
    "sine-wave",
    "checkerboard",
    "stripes",
    "full-green",
    "random-realistic"
  ];
}
