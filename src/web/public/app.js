/**
 * goGreen Studio Frontend Application Logic
 */

const GRID_WEEKS = 53;
const GRID_DAYS = 7;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// App State
const state = {
  grid: Array.from({ length: GRID_DAYS }, () => Array(GRID_WEEKS).fill(0)),
  brushLevel: 4,
  isMouseDown: false,
  currentMode: "draw"
};

// DOM References
const gridContainer = document.getElementById("gridContainer");
const monthHeader = document.getElementById("monthHeader");
const statCommits = document.getElementById("statCommits");
const statDays = document.getElementById("statDays");
const statCoverage = document.getElementById("statCoverage");
const statSpan = document.getElementById("statSpan");
const cliSnippet = document.getElementById("cliSnippet");
const gitBranchText = document.getElementById("gitBranchText");
const statusDot = document.querySelector(".status-dot");

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  initMonthHeaders();
  initGrid();
  initBrushControls();
  initTabs();
  initActionButtons();
  initFormListeners();
  checkGitStatus();
  checkEligibility();
  renderSignatureUsername("CodeByArnob");

  // Load default "GO" text to show off the visual immediately
  applyTextToGrid("GO", 4, true);
});

/**
 * Initializes Month Labels aligned with the columns
 */
function initMonthHeaders() {
  monthHeader.innerHTML = "";
  for (let m = 0; m < 12; m++) {
    const span = document.createElement("span");
    span.className = "month-label";
    span.textContent = MONTHS[m];
    monthHeader.appendChild(span);
  }
}

/**
 * Creates the 7x53 grid of interactive cell DOM elements
 */
function initGrid() {
  gridContainer.innerHTML = "";

  for (let day = 0; day < GRID_DAYS; day++) {
    for (let week = 0; week < GRID_WEEKS; week++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.week = week;
      cell.dataset.day = day;
      cell.dataset.level = state.grid[day][week];
      cell.title = `Week ${week + 1}, Day ${day + 1} - Level ${state.grid[day][week]}`;

      // Mouse drag painting
      cell.addEventListener("mousedown", e => {
        e.preventDefault();
        state.isMouseDown = true;
        setCellLevel(week, day, state.brushLevel);
      });

      cell.addEventListener("mouseenter", () => {
        if (state.isMouseDown) {
          setCellLevel(week, day, state.brushLevel);
        }
      });

      gridContainer.appendChild(cell);
    }
  }

  window.addEventListener("mouseup", () => {
    state.isMouseDown = false;
  });
}

/**
 * Sets a cell's intensity level and refreshes DOM and metrics
 */
function setCellLevel(week, day, level) {
  state.grid[day][week] = level;
  const index = day * GRID_WEEKS + week;
  const cell = gridContainer.children[index];
  if (cell) {
    cell.dataset.level = level;
    cell.title = `Week ${week + 1}, Day ${day + 1} - Level ${level}`;
  }
  updateMetrics();
  updateCliSnippet();
}

/**
 * Syncs the entire state.grid into the DOM cells
 */
function refreshGridDom() {
  for (let day = 0; day < GRID_DAYS; day++) {
    for (let week = 0; week < GRID_WEEKS; week++) {
      const index = day * GRID_WEEKS + week;
      const cell = gridContainer.children[index];
      const level = state.grid[day][week];
      if (cell) {
        cell.dataset.level = level;
        cell.title = `Week ${week + 1}, Day ${day + 1} - Level ${level}`;
      }
    }
  }
  updateMetrics();
  updateCliSnippet();
}

/**
 * Brush intensity buttons
 */
function initBrushControls() {
  const buttons = document.querySelectorAll(".color-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.brushLevel = parseInt(btn.dataset.level, 10);
    });
  });
}

/**
 * Navigation tabs switcher
 */
function initTabs() {
  const tabs = document.querySelectorAll(".tab-btn");
  const modeControls = {
    draw: document.getElementById("controlsDraw"),
    text: document.getElementById("controlsText"),
    patterns: document.getElementById("controlsPatterns"),
    gaps: document.getElementById("controlsGaps"),
    realistic: document.getElementById("controlsRealistic")
  };

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const mode = tab.dataset.mode;
      state.currentMode = mode;

      Object.values(modeControls).forEach(ctrl => ctrl.classList.remove("active"));
      if (modeControls[mode]) {
        modeControls[mode].classList.add("active");
      }
      updateCliSnippet();
    });
  });
}

/**
 * Action button handlers
 */
function initActionButtons() {
  // Clear
  document.getElementById("btnClear").addEventListener("click", () => {
    state.grid = Array.from({ length: GRID_DAYS }, () => Array(GRID_WEEKS).fill(0));
    refreshGridDom();
  });

  // Invert
  document.getElementById("btnInvert").addEventListener("click", () => {
    for (let d = 0; d < GRID_DAYS; d++) {
      for (let w = 0; w < GRID_WEEKS; w++) {
        state.grid[d][w] = state.grid[d][w] > 0 ? 0 : 4;
      }
    }
    refreshGridDom();
  });

  // Fill All
  document.getElementById("btnFillAll").addEventListener("click", () => {
    for (let d = 0; d < GRID_DAYS; d++) {
      for (let w = 0; w < GRID_WEEKS; w++) {
        state.grid[d][w] = state.brushLevel;
      }
    }
    refreshGridDom();
  });

  // Apply Text
  document.getElementById("btnApplyText").addEventListener("click", () => {
    const text = document.getElementById("textInput").value.trim().toUpperCase() || "GO";
    const intensity = parseInt(document.getElementById("textIntensity").value, 10);
    const autoCenter = document.getElementById("textAutoCenter").checked;
    applyTextToGrid(text, intensity, autoCenter);
  });

  // Load Pattern
  document.getElementById("btnApplyPattern").addEventListener("click", async () => {
    const patternName = document.getElementById("patternSelect").value;
    const intensity = parseInt(document.getElementById("patternIntensity").value, 10);
    try {
      const res = await fetch("/api/pattern-grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: patternName, intensity })
      });
      const data = await res.json();
      if (data.success) {
        state.grid = data.grid;
        refreshGridDom();
      }
    } catch (err) {
      console.error("Failed to load pattern:", err);
    }
  });

  // Realistic slider update
  const slider = document.getElementById("activeDaysSlider");
  const daysValue = document.getElementById("daysValue");
  slider.addEventListener("input", () => {
    daysValue.textContent = slider.value;
  });

  // Generate Realistic
  document.getElementById("btnGenerateRealistic").addEventListener("click", async () => {
    const targetDays = parseInt(slider.value, 10);
    try {
      const res = await fetch("/api/pattern-grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "realistic", targetDays })
      });
      const data = await res.json();
      if (data.success) {
        state.grid = data.grid;
        refreshGridDom();
      }
    } catch (err) {
      console.error("Failed to generate realistic activity:", err);
    }
  });

  // Scan Gaps
  document.getElementById("btnScanGaps").addEventListener("click", async () => {
    try {
      const year = document.getElementById("execYear").value;
      const res = await fetch("/api/detect-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          year: year === "rolling" ? undefined : year,
          grid: state.grid
        })
      });
      const data = await res.json();
      if (data.success && data.gaps) {
        document.getElementById("gapsCountBadge").textContent = `${data.gaps.gapDays} blank days`;
      }
    } catch (err) {
      console.error("Failed to scan gaps:", err);
    }
  });

  // Fill Missing Days
  document.getElementById("btnFillGaps").addEventListener("click", () => {
    const intensity = parseInt(document.getElementById("gapFillIntensity").value, 10);
    let filled = 0;
    for (let d = 0; d < GRID_DAYS; d++) {
      for (let w = 0; w < GRID_WEEKS; w++) {
        if (state.grid[d][w] === 0) {
          state.grid[d][w] = intensity;
          filled++;
        }
      }
    }
    refreshGridDom();
    document.getElementById("gapsCountBadge").textContent = `Filled ${filled} days`;
  });

  // Copy CLI command
  document.getElementById("btnCopyCli").addEventListener("click", () => {
    const text = cliSnippet.textContent;
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById("btnCopyCli");
      btn.textContent = "✔ Copied!";
      setTimeout(() => { btn.textContent = "📋 Copy"; }, 2000);
    });
  });

  // Execute Commits
  document.getElementById("btnExecute").addEventListener("click", executeCommits);
}

/**
 * Text-to-grid API call
 */
async function applyTextToGrid(text, intensity, autoCenter) {
  try {
    const res = await fetch("/api/text-to-grid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, intensity, autoCenter })
    });
    const data = await res.json();
    if (data.success) {
      state.grid = data.grid;
      refreshGridDom();
    }
  } catch (err) {
    console.error("Error applying text:", err);
  }
}

/**
 * Updates UI stats (total commits, active days, etc.)
 */
function updateMetrics() {
  let activeDays = 0;
  let totalCommits = 0;
  const counts = [0, 1, 4, 7, 10]; // Commits per level

  for (let d = 0; d < GRID_DAYS; d++) {
    for (let w = 0; w < GRID_WEEKS; w++) {
      const lvl = state.grid[d][w];
      if (lvl > 0) {
        activeDays++;
        totalCommits += counts[lvl] || 0;
      }
    }
  }

  statCommits.textContent = totalCommits;
  statDays.textContent = activeDays;
  const coveragePct = Math.round((activeDays / (GRID_WEEKS * GRID_DAYS)) * 100);
  statCoverage.textContent = `${coveragePct}%`;

  const year = document.getElementById("execYear").value;
  statSpan.textContent = year === "rolling" ? "Past 52 Weeks" : `Calendar ${year}`;
}

/**
 * Updates equivalent CLI command snippet
 */
function updateCliSnippet() {
  const dryRun = document.getElementById("execDryRun").checked;
  const push = document.getElementById("execPush").checked;
  const year = document.getElementById("execYear").value;
  const branch = document.getElementById("execBranch").value.trim();

  let cmd = "gogreen";

  if (state.currentMode === "text") {
    const text = document.getElementById("textInput").value.trim() || "GO";
    cmd += ` text "${text}"`;
  } else if (state.currentMode === "patterns") {
    const pattern = document.getElementById("patternSelect").value;
    cmd += ` pattern ${pattern}`;
  } else if (state.currentMode === "realistic") {
    const days = document.getElementById("activeDaysSlider").value;
    cmd += ` realistic --days ${days}`;
  }

  if (year !== "rolling") cmd += ` --year ${year}`;
  if (branch) cmd += ` --branch "${branch}"`;
  if (dryRun) cmd += " --dry-run";
  if (push) cmd += " --push";

  cliSnippet.textContent = cmd;
}

function initFormListeners() {
  document.getElementById("execYear").addEventListener("change", () => {
    updateMetrics();
    updateCliSnippet();
  });
  document.getElementById("execDryRun").addEventListener("change", updateCliSnippet);
  document.getElementById("execPush").addEventListener("change", updateCliSnippet);
  document.getElementById("execBranch").addEventListener("input", updateCliSnippet);
}

/**
 * Checks GitHub contribution eligibility via backend API
 */
async function checkEligibility() {
  try {
    const res = await fetch("/api/eligibility");
    const data = await res.json();
    const elText = document.getElementById("eligibilityText");
    const elDot = document.getElementById("eligibilityDot");
    if (data.success && data.audit) {
      if (data.audit.isEligible) {
        elDot.classList.add("active");
        elText.textContent = `Eligible (${data.audit.summary.currentBranch})`;
      } else {
        elDot.classList.remove("active");
        elText.textContent = `Audit Notice`;
      }
    }
  } catch (_) {}
}

/**
 * Renders the Signature Developer Identity dot-matrix artwork for @CodeByArnob
 */
async function renderSignatureUsername(username = "CodeByArnob") {
  const container = document.getElementById("usernameDotMatrix");
  if (!container) return;

  try {
    const res = await fetch(`/api/render-signature?text=${encodeURIComponent(username)}`);
    const data = await res.json();
    if (data.success && data.matrix) {
      container.innerHTML = "";
      container.style.gridTemplateColumns = `repeat(${data.cols}, 12px)`;

      for (let r = 0; r < data.rows; r++) {
        for (let c = 0; c < data.cols; c++) {
          const shade = data.matrix[r][c];
          const dot = document.createElement("div");
          dot.className = "u-dot";
          dot.dataset.shade = shade;
          dot.title = `Dot (${c + 1}, ${r + 1}) - GitHub Heatmap Shade ${shade}`;
          container.appendChild(dot);
        }
      }
    }
  } catch (err) {
    console.error("Failed to render signature username:", err);
  }
}

/**
 * Checks Git status via backend API
 */
async function checkGitStatus() {
  try {
    const res = await fetch("/api/status");
    const data = await res.json();
    if (data.success && data.git) {
      statusDot.classList.add("active");
      gitBranchText.textContent = `Branch: ${data.git.currentBranch}`;
      document.getElementById("execBranch").placeholder = data.git.currentBranch;
    } else {
      gitBranchText.textContent = "Git repo detected";
    }
  } catch (_) {
    gitBranchText.textContent = "Offline";
  }
}

/**
 * Executes commits via backend API
 */
async function executeCommits() {
  const btn = document.getElementById("btnExecute");
  const statusBox = document.getElementById("execStatusBox");
  const statusMsg = document.getElementById("execStatusMessage");

  const year = document.getElementById("execYear").value;
  const dryRun = document.getElementById("execDryRun").checked;
  const push = document.getElementById("execPush").checked;
  const branch = document.getElementById("execBranch").value.trim() || undefined;

  // Pre-publish review for live execution
  if (!dryRun) {
    try {
      const revRes = await fetch("/api/pre-publish-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grid: state.grid, year: year === "rolling" ? undefined : year })
      });
      const revData = await revRes.json();
      if (revData.success && revData.report) {
        const confirmed = window.confirm(
          `Review & Confirm Contribution Plan:\n` +
          `• Planned Commits: ${revData.report.totalCommits}\n` +
          `• Active Days: ${revData.report.activeDays}\n` +
          `• Author Email: ${revData.report.eligibilityAudit.summary.gitUserEmail}\n` +
          `• Target Branch: ${branch || revData.report.eligibilityAudit.summary.currentBranch}\n\n` +
          `Notice: ${revData.report.disclaimer}\n\n` +
          `Proceed with committing?`
        );
        if (!confirmed) {
          return;
        }
      }
    } catch (_) {}
  }

  btn.disabled = true;
  btn.innerHTML = `<span class="btn-icon">⏳</span> Processing...`;
  statusBox.classList.remove("hidden");
  statusMsg.textContent = "Scheduling commits and processing...";

  try {
    const res = await fetch("/api/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grid: state.grid,
        year: year === "rolling" ? undefined : year,
        dryRun,
        push,
        branch
      })
    });

    const data = await res.json();
    if (data.success && data.result) {
      const r = data.result;
      if (r.dryRun) {
        statusMsg.innerHTML = `<strong>✔ Dry-Run Completed:</strong> Simulated ${r.totalCommits} commits across ${r.activeDays} days. No changes committed.`;
      } else {
        statusMsg.innerHTML = `<strong>✔ Success:</strong> Committed ${r.totalCommits} commits to branch <code>${r.branch}</code>! ${r.pushed ? "Pushed to GitHub." : "Not pushed (local commits ready)."}`;
      }
    } else {
      statusMsg.innerHTML = `<strong>❌ Error:</strong> ${data.error || "Unknown error occurred"}`;
    }
  } catch (err) {
    statusMsg.innerHTML = `<strong>❌ Request failed:</strong> ${err.message}`;
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<span class="btn-icon">⚡</span> Run Commits`;
  }
}
