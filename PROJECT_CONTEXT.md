# PROJECT CONTEXT: goGreen

**Maintained by:** Arnob's Autonomous AI Software Engineering Agent  
**Repository:** [https://github.com/CodeByArnob/goGreen](https://github.com/CodeByArnob/goGreen)  
**Upstream:** [https://github.com/fenrir2608/goGreen](https://github.com/fenrir2608/goGreen)  
**Last Updated:** 2026-11-22  
**Version:** 2.1.0  

---

## 1. Project Purpose & Product Requirements

`goGreen` is an open-source engineering tool created specifically to help developers visualize, audit, and manage genuine gaps in their personal GitHub Contribution Calendar.

### Primary Objectives:
- **Missing-Day Gap Detection**: Scan a user's GitHub contribution history or repository commit log over a rolling 52-week or designated calendar year to identify zero-activity dates.
- **Customizable Pattern & Typography Engine**: Provide an auto-centered 5×7 bitmap font engine and retro 8-bit sprites to render clean custom words and patterns across the 53-week × 7-day grid.
- **GitHub Contribution Eligibility Compliance**: Enforce GitHub's official contribution eligibility rules:
  1. Author email on commits must be attached to the user's GitHub account (supports GitHub privacy-preserving `ID+username@users.noreply.github.com`).
  2. Commits must be made directly to the default branch (`main`).
  3. Strict transparency warnings regarding repository status (GitHub policy does not count commits in a fork on profile graphs by default unless PRs are merged or the repository is standalone).
  4. Future-date protection: reject or warn against future-dated commits.
- **Pre-Publish Review & Transparency**: Require explicit review of every planned commit, email identity, branch, and disclaimer prior to applying commits or pushing.
- **Zero-Vulnerability Foundation**: Modernized architecture replacing legacy vulnerable dependencies with zero-CVE packages (`simple-git ^4.1.0`, `dayjs ^1.11.23`).

---

## 2. Architecture & Technology Decisions

| Subsystem | Technology | Architectural Rationale |
| :--- | :--- | :--- |
| **Runtime** | Node.js (>=18.0.0, ESM) | Native ES modules, standard across modern developer environments. |
| **Git Driver** | `simple-git ^4.1.0` | Upgraded from legacy `<=3.25.0` to eliminate critical RCE vulnerabilities. |
| **Date & Calendar** | `dayjs ^1.11.23` | Replaced vulnerable and deprecated `moment` with lightweight, zero-CVE library. |
| **CLI & Commands** | `commander ^15.1.0` | Clean command routing, options, and help generation. |
| **Interactive Wizard** | `inquirer ^14.3.1` | Step-by-step terminal prompt interface. |
| **Visual Studio Web UI** | `node:http` (Native) | Zero-dependency local preview server on `http://localhost:3300`. |
| **Testing Engine** | `node --test` (Native) | Built-in test runner with zero external test runner bloat. Fast (sub-second execution). |
| **CI/CD** | GitHub Actions | Matrix validation on Ubuntu across Node.js 18.x, 20.x, and 22.x. |

---

## 3. Completed Features (v2.1.0)

1. **GitHub Eligibility Audit Engine (`src/core/eligibility.js`)**:
   - `auditContributionEligibility()`: Checks `git config user.email`, default branch (`main`), remote origin, and fork status.
   - `validateCommitDates()`: Blocks/warns against future-dated commits.
   - CLI command: `gogreen audit` / `gogreen check-eligibility`.
2. **Missing-Day Gap Detector (`src/core/gap-detector.js`)**:
   - `fetchLiveGitHubContributions()`: Live query to GitHub GraphQL API for exact historical contribution days and levels.
   - `detectContributionGaps()`: Scans 371-day window and flags days with 0 commits across any historical year.
   - `scanHistoricalYears()`: Multi-year audit across 2023, 2024, 2025, and 2026.
   - `generateGapFillPlan()`: Generates commit schedules targeting solely the inactive days.
   - CLI command: `gogreen gaps --year 2024` and `gogreen gaps --all-years`.
3. **Automated Cloud Scheduled Audit Workflow (`.github/workflows/audit-schedule.yml`)**:
   - Runs in GitHub Actions every Monday at 09:00 AM Bangladesh time (`Asia/Dhaka`, UTC+6 = 03:00 UTC).
   - Audits contribution eligibility, checks all historical years, and publishes report to `$GITHUB_STEP_SUMMARY` and artifact without unauthorized repo modifications.
   - Script: `src/cli/generate-report.js`.
4. **Pre-Publish Review & Disclaimer Engine (`src/core/commit-reviewer.js`)**:
   - `generatePrePublishReport()`: Formats pre-publish report table.
   - `printTerminalReview()`: Renders review table with safety checks and transparency notices.
5. **5×7 Bitmap Typography Engine (`src/core/font.js`)**:
   - Glyph dictionary (A–Z, 0–9, symbols) with horizontal auto-centering.
   - CLI command: `gogreen text "<string>"`.
6. **Preset Pixel Art Engine (`src/core/patterns.js`)**:
   - 11 built-in presets: `heart`, `space-invader`, `pacman`, `ghost`, `smiley`, `hearts`, `sine-wave`, `checkerboard`, `stripes`, `full-green`, `random-realistic`.
   - CLI command: `gogreen pattern <name>`.
7. **Visual Studio Web UI (`src/web/`)**:
   - Interactive 53×7 clickable/draggable grid canvas.
   - Real-time gap scanning and fill button.
   - Live eligibility status badge.
   - Pre-publish confirmation modal before commit execution.
8. **Automated Test Suite (`tests/`)**:
   - 25 unit and integration tests passing with 100% success rate.
   - GitHub Actions CI workflow configured and green.

---

## 4. Known Limitations & GitHub Policy Considerations

- **Fork vs. Standalone Policy**: GitHub's contribution graph does not show commits made in a repository fork on the profile graph by default. For guaranteed contribution recognition on GitHub profiles, commits should be made to a standalone repository owned by the user or merged via pull request into upstream.
- **Email Matching**: Commits will only appear under the user's GitHub profile if the author email matches an email registered to the GitHub account (such as `ID+username@users.noreply.github.com`).
- **Local vs. Cloud Execution**: Currently runs locally on the host machine. Unattended background jobs require configuring Antigravity scheduled automation sidecars.

---

## 5. Build & Testing Status

- **Node Syntax / Lint (`npm run check`)**: PASS
- **Test Suite (`npm test`)**: 25 / 25 PASS (0 failures, duration ~400ms)
- **Security Audit (`npm audit`)**: 0 vulnerabilities
- **GitHub Actions CI**: [![CI](https://github.com/CodeByArnob/goGreen/actions/workflows/ci.yml/badge.svg)](https://github.com/CodeByArnob/goGreen/actions/workflows/ci.yml) Passing (Node 18.x, 20.x, 22.x)

---

## 6. Next Recommended Steps

1. **Standalone Repository Option**: Provide a CLI command (`gogreen export-standalone`) that clones or re-initializes the contribution history into a fresh standalone repository under `CodeByArnob` to ensure GitHub counts 100% of commits on profile graphs without fork restrictions.
2. **Scheduled Gap Audit Automation**: Set up a background scheduled sidecar to audit weekly contribution gaps and alert the user.
3. **Multi-Year Grid Stitching**: Support multi-year contiguous contribution panoramas spanning 2 to 5 consecutive years.
