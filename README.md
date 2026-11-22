# 🌱 goGreen

[![CI](https://github.com/CodeByArnob/goGreen/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeByArnob/goGreen/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Vulnerabilities](https://img.shields.io/badge/vulnerabilities-0-brightgreen)](https://github.com/CodeByArnob/goGreen)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/CodeByArnob/goGreen/pulls)

> **Modern, safe, and interactive studio to draw pixel art, render custom typography, and simulate realistic developer activity on your GitHub contribution graph.**

```
    NovDec    Jan    Feb    Mar      Apr    May      Jun    Jul    Aug      Sep    Oct    Nov    
Sun ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ 
Mon ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ 
Tue ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ 
Wed ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ 
Thu ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ 
Fri ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ 
Sat ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ 
    Less ■ ■ ■ ■ ■ More
```

---

## ✨ Features

- 🌐 **Interactive Web Visual Studio**: Built-in, zero-dependency browser designer (`gogreen web`). Click and drag to paint green shades freely on a live 53×7 calendar grid!
- 🔤 **Custom Typography & Words**: Type any word or phrase (e.g. `HI`, `CODE`, `GO`) and render it automatically centered on your contribution graph with our 5×7 bitmap font engine.
- 🎨 **Preset 8-bit Pixel Art**: Instant presets including **Heart**, **Space Invader**, **Pac-Man & Ghost**, **Smiley Face**, **Sine Wave**, **Checkerboard**, and **Stripes**.
- 📈 **Natural Activity Simulation**: Generate organic developer commit histories with realistic Monday–Friday work patterns, lower weekend activity, and natural vacation gaps.
- 🛡️ **Safety-First Git Engine**:
  - **Dry-Run mode by default**: Preview every commit, active day, and date range before making changes.
  - **Safe push guards**: Accidental pushes to the original author's repository are strictly blocked. Remote pushing requires explicit confirmation (`--push`).
  - **Accurate timestamps**: Sets both `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` simultaneously for 100% calendar placement accuracy.
- 🔒 **Zero Vulnerabilities**: Completely eliminated all legacy CVEs present in earlier versions (`simple-git` upgraded to secure `^4.1.0`, deprecated `moment` replaced with lightweight `dayjs`).
- ⚡ **Automated Testing Suite**: 100% passing tests using Node.js native test runner and GitHub Actions CI.

---

## 🚀 Quick Start

### 1. Run Directly with npx (No Installation Needed)
```bash
npx gogreen
```
*Launches the guided interactive terminal wizard.*

### 2. Or Clone and Run Locally
```bash
git clone https://github.com/CodeByArnob/goGreen.git
cd goGreen
npm install
```

Start the interactive terminal wizard:
```bash
npm start
```

Or launch the visual web designer:
```bash
npm run web
```
*Opens `http://localhost:3300` in your default browser.*

---

## 💻 CLI Usage & Commands

### 🔍 Contribution Eligibility Audit
Audit your local Git author email, default branch, repository ownership, and GitHub contribution compatibility:
```bash
node bin/gogreen.js audit
```

### 📊 Missing-Day Gap Detection & Filling
Scan your calendar window to identify inactive dates (0 commits) and optionally fill them:
```bash
# Scan and report blank days for 2024
node bin/gogreen.js gaps --year 2024

# Preview a plan to fill missing days with subtle activity (Level 1)
node bin/gogreen.js gaps --year 2024 --fill --intensity 1 --dry-run

# Execute gap fill commits locally
node bin/gogreen.js gaps --year 2024 --fill --intensity 1 --dry-run=false
```

### 🔤 Text Art (Spell Words on Your Graph)
Write custom text centered horizontally on your calendar:
```bash
# Preview text with dry-run
node bin/gogreen.js text "HI" --dry-run

# Custom green intensity level (1 to 4)
node bin/gogreen.js text "CODE" --intensity 4 --dry-run

# Commit locally without pushing
node bin/gogreen.js text "GO" --dry-run=false

# Target a specific calendar year
node bin/gogreen.js text "2024" --year 2024 --dry-run
```

### 🎨 Preset Pixel Art
Render built-in retro pixel art:
```bash
# List available patterns
node bin/gogreen.js pattern --list

# Preview a space invader
node bin/gogreen.js pattern space-invader --dry-run

# Preview a pixel heart
node bin/gogreen.js pattern heart --dry-run

# Preview Pac-Man and Ghost
node bin/gogreen.js pattern pacman --dry-run
```

Available presets:
- `heart`
- `space-invader`
- `pacman`
- `ghost`
- `smiley`
- `hearts`
- `sine-wave`
- `checkerboard`
- `stripes`
- `full-green`
- `random-realistic`

### 📈 Realistic Activity Simulation
Simulate human developer activity across a whole year:
```bash
# Simulate ~160 active contribution days
node bin/gogreen.js realistic --days 160 --dry-run

# Apply to a dedicated branch
node bin/gogreen.js realistic --days 180 --branch activity-history --dry-run=false
```

### 🌐 Web Studio UI
```bash
node bin/gogreen.js web --port 3300
```
Key features in Web Studio:
1. **Interactive Canvas**: Click or drag across the 53×7 grid to paint shades of green.
2. **Preset Art Switcher**: Load any preset pattern with 1 click.
3. **Live Typography Preview**: Type text and see it immediately reflected on the calendar.
4. **Real-Time Plan Metrics**: Displays total commit count, active days count, and year coverage percentage.
5. **Instant CLI Command Generator**: Generates the exact reproducible CLI command for your current design.

---

## 🛠️ Programmatic Node.js API

You can also use `goGreen` as a JavaScript library in your own Node.js projects:

```javascript
import {
  textToGrid,
  generatePatternGrid,
  gridToCommitPlan,
  executeCommitPlan,
  getCalendarStartDate
} from "gogreen";

// 1. Generate a 53x7 grid with text
const grid = textToGrid("DEV", { intensity: 4, autoCenter: true });

// 2. Map coordinates to calendar dates
const startDate = getCalendarStartDate({ year: 2024 });
const plan = gridToCommitPlan(grid, { startDate });

// 3. Execute dry-run simulation
const result = await executeCommitPlan(plan, { dryRun: true });
console.log(`Planned ${result.totalCommits} commits across ${result.activeDays} days.`);
```

---

## 📁 Project Architecture

```
goGreen/
├── .github/workflows/
│   └── ci.yml                 # Automated CI workflow (Node 18, 20, 22)
├── bin/
│   └── gogreen.js             # CLI binary entrypoint (npx gogreen)
├── src/
│   ├── index.js               # Programmatic API export
│   ├── core/
│   │   ├── calendar.js        # GitHub 53x7 grid-to-date coordinate mapper
│   │   ├── config.js          # Constants, thresholds, and color palettes
│   │   ├── font.js            # 5x7 ASCII pixel font matrix dictionary
│   │   ├── git-engine.js      # Safe Git execution engine & push guards
│   │   └── patterns.js        # Built-in pixel art sprite generators
│   ├── cli/
│   │   ├── index.js           # Commander CLI routing & option parsers
│   │   ├── prompt.js          # Interactive terminal wizard
│   │   └── visualizer.js      # Terminal ANSI contribution grid renderer
│   └── web/
│       ├── server.js          # Zero-dependency local preview HTTP server
│       └── public/
│           ├── index.html     # Studio web interface
│           ├── style.css      # GitHub dark theme styling
│           └── app.js         # Interactive canvas and paint controls
├── tests/
│   ├── calendar.test.js       # Grid coordinate calculation tests
│   ├── font.test.js           # Font glyph & text matrix tests
│   ├── git-engine.test.js     # Git safeguards and dry-run tests
│   ├── patterns.test.js       # Pattern generator bounds tests
│   └── web-server.test.js     # Web API & asset serving tests
├── docs/
│   └── ARCHITECTURE.md        # Technical architectural specification
├── package.json
└── README.md
```

---

## 🧪 Testing

Run the automated test suite:
```bash
npm test
```

Run syntax checks:
```bash
npm run check
```

Audit dependencies for security vulnerabilities:
```bash
npm audit
```

---

## 🛡️ Safety & Best Practices

1. **Always use `--dry-run` first**: Check the terminal grid preview and commit counts before executing live commits.
2. **Use dedicated branches**: Instead of committing directly to your default branch (`main`), consider creating a dedicated activity branch (e.g. `--branch activity-history`).
3. **Never push credentials or personal secrets**: goGreen only modifies an innocuous `data.json` timestamp file.
4. **Safe Remotes**: goGreen includes built-in guards ensuring commits can never be pushed to upstream repositories.

---

## 📜 License & Credits

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

- Original concept and proof of concept by [fenrir2608](https://github.com/fenrir2608/goGreen).
- Inspired by the educational tutorial by [Akshay Saini](https://github.com/akshaymarch7).
- Architecture, visual designer, 5×7 pixel font engine, CLI suite, and test infrastructure engineered by [CodeByArnob](https://github.com/CodeByArnob).
