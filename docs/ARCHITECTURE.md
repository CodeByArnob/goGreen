# goGreen Architecture & Engineering Specification

## 1. System Overview

`goGreen` is an automation engine and visual designer that maps custom visual patterns, typography, and realistic activity distributions onto the GitHub contribution graph (53 weeks x 7 days).

```
                      +-----------------------------+
                      |      User Interface         |
                      |  - CLI (Commander.js)       |
                      |  - Interactive TTY Wizard   |
                      |  - Visual Studio (Web UI)   |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |        Core Engine          |
                      |  - Calendar Coordinates     |
                      |  - 5x7 Pixel Font Matrix    |
                      |  - Pattern Generators       |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |     Git Execution Engine    |
                      |  - Safe Remote Guards       |
                      |  - Dry-Run Simulation       |
                      |  - Atomic Timestamps        |
                      |  - simple-git v4 driver     |
                      +-----------------------------+
```

---

## 2. Core Modules

### 2.1 Calendar Coordinate Engine (`src/core/calendar.js`)
- **Grid Structure**: 53 columns (weeks 0 to 52) by 7 rows (days 0 = Sunday to 6 = Saturday), representing up to 371 calendar cells.
- **Anchor Date**: Computes week 0 Sunday either rolling back 52 weeks from the current week, or anchoring to a designated calendar year (e.g., 2023, 2024).
- **Coordinate Transformation**: Bi-directional mapping between `(week, day)` and exact ISO timestamps (`coordinateToDate` and `dateToCoordinate`).
- **Intensity Mapping**: Converts green levels (0 to 4) into discrete commit count distributions.

### 2.2 5x7 Pixel Font Matrix (`src/core/font.js`)
- **Glyph Dictionary**: Custom bitmap font covering A-Z, 0-9, and symbols (`!`, `?`, `-`, `+`, `.`, `:`, `<3`).
- **Auto-Centering**: Automatically calculates total string width across columns and centers the text horizontally on the 53-week canvas.
- **Letter Spacing**: Configurable column spacing between characters.

### 2.3 Preset Pattern Generators (`src/core/patterns.js`)
- **Pixel Sprites**: Built-in 8-bit sprites designed for a 7-pixel vertical resolution:
  - `heart`: Centered 7x7 pixel heart
  - `space-invader`: Classic 7x11 arcade alien sprite
  - `pacman`: Pacman and arcade ghost
  - `ghost`: Retro arcade ghost
  - `smiley`: Happy pixel face
  - `sine-wave`: Mathematical trigonometric wave across the 53 weeks
  - `checkerboard` & `stripes`: Alternating grid geometries
  - `random-realistic`: Organic simulation modeling real developer commit habits (higher Tuesday-Thursday activity, low weekend volume, intermittent vacation weeks).

### 2.4 Git Execution Engine & Safeguards (`src/core/git-engine.js`)
- **Remote Safety Protection**: Inspects configured remotes before push. Rejects any attempt to push to the original author repository (`fenrir2608/goGreen`).
- **Dry-Run Sandbox**: Simulates the planned commits and validates schedule integrity without modifying Git history or remote repositories.
- **Atomic Timestamps**: Sets both `GIT_AUTHOR_DATE` and `GIT_COMMITTER_DATE` to match each planned commit.
- **Progress Reporting**: Real-time callback emissions reporting percentage, current commit index, and ISO timestamp.

### 2.5 Built-in Visual Studio Server (`src/web/server.js`)
- **Zero External Server Dependencies**: Built purely on Node.js standard library (`node:http`, `node:fs`, `node:path`).
- **REST API Endpoints**:
  - `GET /api/status`: Inspects repository health, current branch, and remotes.
  - `GET /api/patterns`: Lists preset pattern descriptors.
  - `POST /api/pattern-grid`: Generates a 7x53 grid for a selected pattern.
  - `POST /api/text-to-grid`: Converts arbitrary text into a 7x53 grid.
  - `POST /api/plan-summary`: Computes summary metrics for any custom grid.
  - `POST /api/execute`: Runs or dry-runs commit generation with optional push.

---

## 3. Security Hardening

| Component | Previous State | Upgraded State | Impact |
| :--- | :--- | :--- | :--- |
| `simple-git` | `<=3.25.0` (Critical RCE: GHSA-jcxm-m3jx-f287, GHSA-r275-fr43-pm7q, GHSA-858h-whjf-mvg5) | `^4.1.0` | Eliminates arbitrary command injection vulnerabilities. |
| `moment` | `2.30.1` (Moderate Path Traversal: GHSA-4p3w-j4w9-5jqw, Deprecated) | Replaced with `dayjs ^1.11.23` | Zero vulnerabilities, 95% bundle reduction. |
| Automatic Push | Original script unconditionally executed `simpleGit().push()` | Pushing requires explicit `--push` flag or explicit toggle in UI | Prevents accidental repo corruption. |

---

## 4. Testing & Verification

The project includes unit and integration tests under `tests/` executed via Node.js native test runner (`node --test`):
- `tests/calendar.test.js`: Grid math and coordinate roundtrips.
- `tests/font.test.js`: Glyph resolution, text-to-grid dimensions, and auto-centering.
- `tests/patterns.test.js`: Pattern bounds, preset loading, and realistic generator behavior.
- `tests/git-engine.test.js`: Safety guards and dry-run execution.
- `tests/web-server.test.js`: HTTP endpoints and static asset serving.
