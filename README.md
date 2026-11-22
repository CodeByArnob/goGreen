# 🌱 goGreen

[![CI](https://github.com/CodeByArnob/goGreen/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeByArnob/goGreen/actions/workflows/ci.yml)
[![Weekly Audit](https://github.com/CodeByArnob/goGreen/actions/workflows/audit-schedule.yml/badge.svg)](https://github.com/CodeByArnob/goGreen/actions/workflows/audit-schedule.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Vulnerabilities](https://img.shields.io/badge/vulnerabilities-0-brightgreen)](https://github.com/CodeByArnob/goGreen)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/CodeByArnob/goGreen/pulls)

> **Modern, safe, and transparent tool to audit, detect gaps, and design genuine-compliant GitHub contribution graph activity.**

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

- 🌟 **Signature Developer Identity Typography**: Prominently displays `@CodeByArnob` in the Web Studio using dynamically rendered green-dot pixel-art typography with GitHub heatmap shades (`#0e4429`, `#006d32`, `#26a641`, `#39d353`) and subtle ambient depth glow.
- 🔍 **Live GitHub Contribution Audit**: Audit your author email, default branch, and repository fork status against GitHub's official contribution eligibility rules (`gogreen audit`).
- 📊 **Missing-Day Gap Detection**: Connect to GitHub's GraphQL API or local Git history to detect days with zero activity across 2023, 2024, 2025, and 2026 (`gogreen gaps --all-years`).
- 🛡️ **Pre-Publish Commit Review**: Inspect every commit date, author email, and compliance checklist with built-in future-date protection before committing or pushing.
- ⏰ **Cloud-Based Automated Weekly Audit**: GitHub Actions cron scheduler audits your contribution gaps every Monday at 9:00 AM Bangladesh time (`Asia/Dhaka`), generating a rich summary report and preserving history in `audits/` without unauthorized commits.
- 📜 **Historical Audit Ledger**: Automatically archives every audit run to `audits/audit-YYYY-MM-DD.md` and maintains a running history index in `audits/HISTORY.md`.
- 🌐 **Interactive Web Visual Studio**: Zero-dependency browser designer (`gogreen web`). Click and drag to paint green shades freely on a live 53×7 calendar grid!
- 🔤 **Custom Typography & Words**: Type any word or phrase (e.g. `HI`, `CODE`, `GO`) and render it automatically centered on your contribution graph with our 5×7 bitmap font engine.
- 🎨 **Preset 8-bit Pixel Art**: Instant presets including **Heart**, **Space Invader**, **Pac-Man & Ghost**, **Smiley Face**, **Sine Wave**, **Checkerboard**, and **Stripes**.
- 📈 **Natural Activity Simulation**: Generate organic developer commit histories with realistic Monday–Friday work patterns and lower weekend volume.
- 🔒 **Zero Vulnerabilities**: All legacy CVEs eliminated (`simple-git ^4.1.0`, `dayjs ^1.11.23`).

---

## 🚀 Quick Start

### 1. Run Guided Wizard (No Installation Needed)
```bash
npx gogreen
```

### 2. Clone and Run Locally
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

### 📊 Missing-Day Gap Detection
Scan your contribution calendar using live GitHub GraphQL API data to identify inactive dates (0 commits):
```bash
# Scan and report blank days for 2024
node bin/gogreen.js gaps --year 2024

# Scan all historical years (2023, 2024, 2025, 2026)
node bin/gogreen.js gaps --all-years

# Force local repository Git history scan only (offline mode)
node bin/gogreen.js gaps --year 2024 --local

# Preview a plan to fill missing days with subtle activity (Level 1)
node bin/gogreen.js gaps --year 2024 --fill --intensity 1 --dry-run
```

### 🔤 Text Art (Spell Words on Your Graph)
Write custom text centered horizontally on your calendar:
```bash
# Preview text with dry-run
node bin/gogreen.js text "HI" --dry-run

# Custom green intensity level (1 to 4)
node bin/gogreen.js text "CODE" --intensity 4 --dry-run

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
```

### 🌐 Web Studio UI
```bash
node bin/gogreen.js web --port 3300
```

---

## ⏰ Cloud-Based Automated Audit (GitHub Actions)

`goGreen` includes an always-on cloud audit workflow ([`.github/workflows/audit-schedule.yml`](.github/workflows/audit-schedule.yml)) running on GitHub's infrastructure:

- **Cadence**: Every Monday at **9:00 AM Bangladesh Time (`Asia/Dhaka`, UTC+6)** (Cron: `0 3 * * 1` in UTC).
- **Execution**: Runs in GitHub Actions cloud runners independent of whether your personal PC is awake or connected.
- **Reporting**: Audits contribution eligibility, scans historical gap days, and publishes the report to:
  1. The GitHub Actions Step Summary tab for immediate web viewing.
  2. A downloadable run artifact (`AUDIT_REPORT.md`).
- **Read-Only Safety Guarantee**: The cloud scheduler **never commits, pushes, or alters your repositories without explicit approval**.

---

## 🛡️ Official GitHub Contribution Rules & Troubleshooting

If your commits are not displaying on your GitHub profile, verify the following official GitHub contribution criteria:

### 1. Author Email Association
- **Rule**: The email address used to author commits MUST be attached to your GitHub account under **Settings → Emails**.
- **Privacy Recommended**: You can use GitHub's official noreply email: `<id>+<username>@users.noreply.github.com`.
- **How to fix**:
  ```bash
  git config user.name "CodeByArnob"
  git config user.email "68462590+CodeByArnob@users.noreply.github.com"
  ```

### 2. Default Branch Requirement
- **Rule**: GitHub's contribution graph *only counts commits made to the default branch* (typically `main`) or `gh-pages`.
- **Note**: Commits made to feature branches will NOT count until merged into the default branch.

### 3. Repository Fork Policy
- **Rule**: GitHub does not display commits made in a repository fork on profile contribution graphs by default.
- **Solutions**:
  1. Enable **"Include private contributions and contributions to forks"** in your GitHub profile settings.
  2. Or maintain activity in a standalone (non-fork) repository under your account.
  3. Or merge changes via pull request into the parent repository.

### 4. Timestamp Validity
- **Rule**: Commits with future timestamps will not count toward your contribution calendar until that date actually occurs.

---

## 📁 Project Architecture

```
goGreen/
├── .github/workflows/
│   ├── ci.yml                 # Automated CI workflow (Node 18, 20, 22)
│   └── audit-schedule.yml     # Weekly Monday 9:00 AM BST cloud audit
├── bin/
│   └── gogreen.js             # CLI binary entrypoint (npx gogreen)
├── docs/
│   └── ARCHITECTURE.md        # Technical architectural specification
├── src/
│   ├── index.js               # Programmatic API export
│   ├── core/
│   │   ├── calendar.js        # GitHub 53x7 grid-to-date coordinate mapper
│   │   ├── commit-reviewer.js # Pre-publish audit & review engine
│   │   ├── config.js          # Constants, thresholds, and color palettes
│   │   ├── eligibility.js     # GitHub contribution eligibility checker
│   │   ├── font.js            # 5x7 ASCII pixel font matrix dictionary
│   │   ├── gap-detector.js    # Live GraphQL and local gap detection
│   │   ├── git-engine.js      # Safe Git execution engine & push guards
│   │   └── patterns.js        # Built-in pixel art sprite generators
│   ├── cli/
│   │   ├── generate-report.js # Markdown report generator
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
│   ├── commit-reviewer.test.js# Pre-publish review tests
│   ├── eligibility.test.js    # Eligibility audit tests
│   ├── font.test.js           # Font glyph & text matrix tests
│   ├── gap-detector.test.js   # Gap detector & fill plan tests
│   ├── git-engine.test.js     # Git safeguards and dry-run tests
│   ├── patterns.test.js       # Pattern generator bounds tests
│   └── web-server.test.js     # Web API & asset serving tests
├── AUDIT_REPORT.md            # Generated weekly audit report
├── PROJECT_CONTEXT.md         # Persistent project memory
├── package.json
└── README.md
```

---

## 🧪 Testing

Run the automated test suite (25 tests):
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

## 📜 License & Credits

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

- Original concept by [fenrir2608](https://github.com/fenrir2608/goGreen).
- Architecture, live GraphQL gap detector, visual studio, 5×7 pixel font engine, CLI suite, and test infrastructure engineered by [CodeByArnob](https://github.com/CodeByArnob).
