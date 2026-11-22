/**
 * goGreen Built-in Web Server & API
 * Lightweight zero-dependency HTTP server for the interactive visual designer.
 */

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { textToGrid } from "../core/font.js";
import { generatePatternGrid, PRESET_PATTERNS, listAvailablePatterns } from "../core/patterns.js";
import { getCalendarStartDate, gridToCommitPlan, summarizePlan, generateEmptyGrid } from "../core/calendar.js";
import { executeCommitPlan, inspectGitState } from "../core/git-engine.js";
import { auditContributionEligibility } from "../core/eligibility.js";
import { detectContributionGaps } from "../core/gap-detector.js";
import { generatePrePublishReport } from "../core/commit-reviewer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

/**
 * Parses JSON request body.
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 2 * 1024 * 1024) {
        reject(new Error("Request payload too large"));
      }
    });
    req.on("end", () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Creates the HTTP Request Listener.
 */
export function createRequestListener() {
  return async (req, res) => {
    // Enable CORS for local development
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const pathname = url.pathname;

    try {
      // API: GET /api/status
      if (pathname === "/api/status" && req.method === "GET") {
        try {
          const gitState = await inspectGitState();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, git: gitState }));
        } catch (err) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // API: GET /api/eligibility
      if (pathname === "/api/eligibility" && req.method === "GET") {
        try {
          const audit = await auditContributionEligibility();
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true, audit }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
        return;
      }

      // API: POST /api/detect-gaps
      if (pathname === "/api/detect-gaps" && req.method === "POST") {
        const body = await parseJsonBody(req);
        const gapsData = await detectContributionGaps({
          year: body.year ? parseInt(body.year, 10) : undefined,
          existingGrid: body.grid
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, gaps: gapsData }));
        return;
      }

      // API: POST /api/pre-publish-review
      if (pathname === "/api/pre-publish-review" && req.method === "POST") {
        const body = await parseJsonBody(req);
        const grid = body.grid || generateEmptyGrid();
        const calOpts = body.year ? { year: parseInt(body.year, 10) } : {};
        const startDate = getCalendarStartDate(calOpts);
        const plan = gridToCommitPlan(grid, { startDate });
        const audit = await auditContributionEligibility();
        const report = generatePrePublishReport(plan, audit);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, report }));
        return;
      }

      // API: GET /api/patterns
      if (pathname === "/api/patterns" && req.method === "GET") {
        const patterns = listAvailablePatterns().map(name => {
          const preset = PRESET_PATTERNS[name];
          return {
            id: name,
            name: preset ? preset.name : name,
            description: preset ? preset.description : `Preset ${name} pattern`
          };
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, patterns }));
        return;
      }

      // API: POST /api/pattern-grid
      if (pathname === "/api/pattern-grid" && req.method === "POST") {
        const body = await parseJsonBody(req);
        const grid = generatePatternGrid(body.name, {
          intensity: body.intensity || 4,
          targetDays: body.targetDays
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, grid }));
        return;
      }

      // API: POST /api/text-to-grid
      if (pathname === "/api/text-to-grid" && req.method === "POST") {
        const body = await parseJsonBody(req);
        const text = body.text || "";
        const grid = textToGrid(text, {
          intensity: body.intensity || 4,
          autoCenter: body.autoCenter !== false,
          spacing: body.spacing ?? 1
        });
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, grid }));
        return;
      }

      // API: POST /api/plan-summary
      if (pathname === "/api/plan-summary" && req.method === "POST") {
        const body = await parseJsonBody(req);
        const grid = body.grid || generateEmptyGrid();
        const calOpts = body.year ? { year: parseInt(body.year, 10) } : {};
        const startDate = getCalendarStartDate(calOpts);
        const plan = gridToCommitPlan(grid, { startDate });
        const summary = summarizePlan(plan);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, summary, planCount: plan.length }));
        return;
      }

      // API: POST /api/execute
      if (pathname === "/api/execute" && req.method === "POST") {
        const body = await parseJsonBody(req);
        const grid = body.grid || generateEmptyGrid();
        const calOpts = body.year ? { year: parseInt(body.year, 10) } : {};
        const startDate = getCalendarStartDate(calOpts);
        const plan = gridToCommitPlan(grid, { startDate });

        const result = await executeCommitPlan(plan, {
          dryRun: body.dryRun !== false, // Default true for safety
          push: Boolean(body.push),
          branch: body.branch,
          commitMessage: body.message || "🌱 goGreen visual designer update"
        });

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, result }));
        return;
      }

      // Static file serving:
      let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);

      // Security check: prevent directory traversal
      if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }

      try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
          filePath = path.join(filePath, "index.html");
        }
        const ext = path.extname(filePath).toLowerCase();
        const mimeType = MIME_TYPES[ext] || "application/octet-stream";
        const content = await fs.readFile(filePath);

        res.writeHead(200, { "Content-Type": mimeType });
        res.end(content);
      } catch (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("Not Found");
      }
    } catch (err) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  };
}

/**
 * Starts the Web Server.
 * @param {Object} [options]
 * @param {number} [options.port=3300]
 * @param {boolean} [options.openBrowser=true]
 * @returns {Promise<http.Server>}
 */
export async function startWebServer(options = {}) {
  const port = options.port || 3300;
  const server = http.createServer(createRequestListener());

  return new Promise((resolve, reject) => {
    server.listen(port, async () => {
      const url = `http://localhost:${port}`;
      console.log(`\n🌱 goGreen Visual Designer running at: \x1b[36m${url}\x1b[0m`);
      console.log(`Press Ctrl+C to stop the server.\n`);

      if (options.openBrowser !== false) {
        try {
          const { exec } = await import("node:child_process");
          const cmd = process.platform === "win32" ? `start ${url}` : process.platform === "darwin" ? `open ${url}` : `xdg-open ${url}`;
          exec(cmd);
        } catch (_) {}
      }

      resolve(server);
    });

    server.on("error", reject);
  });
}
