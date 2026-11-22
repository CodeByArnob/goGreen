import test from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { createRequestListener } from "../src/web/server.js";

function startTestServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(createRequestListener());
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const baseUrl = `http://127.0.0.1:${address.port}`;
      resolve({ server, baseUrl });
    });
    server.on("error", reject);
  });
}

function stopTestServer(server) {
  return new Promise(resolve => server.close(resolve));
}

test("web-server: serves index.html and static assets", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(text.includes("goGreen Studio"));

    const cssRes = await fetch(`${baseUrl}/style.css`);
    assert.equal(cssRes.status, 200);
    assert.equal(cssRes.headers.get("content-type"), "text/css; charset=utf-8");

    const jsRes = await fetch(`${baseUrl}/app.js`);
    assert.equal(jsRes.status, 200);
    assert.equal(jsRes.headers.get("content-type"), "application/javascript; charset=utf-8");
    // 5. GET /api/eligibility
    const elRes = await fetch(`${baseUrl}/api/eligibility`);
    const elData = await elRes.json();
    assert.equal(elRes.status, 200);
    assert.equal(elData.success, true);
    assert.ok(Array.isArray(elData.audit.checks));

    // 6. POST /api/detect-gaps
    const gapsRes = await fetch(`${baseUrl}/api/detect-gaps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: 2024 })
    });
    const gapsData = await gapsRes.json();
    assert.equal(gapsRes.status, 200);
    assert.equal(gapsData.success, true);
    assert.ok(gapsData.gaps.totalCalendarDays > 0);
    // 7. GET /api/render-signature
    const sigRes = await fetch(`${baseUrl}/api/render-signature?text=CodeByArnob`);
    const sigData = await sigRes.json();
    assert.equal(sigRes.status, 200);
    assert.equal(sigData.success, true);
    assert.equal(sigData.text, "CodeByArnob");
    assert.equal(sigData.rows, 7);
    assert.ok(sigData.cols > 40);
  } finally {
    await stopTestServer(server);
  }
});

test("web-server: API endpoints respond with correct schemas", async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    // 1. GET /api/patterns
    const patRes = await fetch(`${baseUrl}/api/patterns`);
    const patData = await patRes.json();
    assert.equal(patRes.status, 200);
    assert.equal(patData.success, true);
    assert.ok(patData.patterns.length > 0);

    // 2. POST /api/text-to-grid
    const textRes = await fetch(`${baseUrl}/api/text-to-grid`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "TEST", intensity: 4, autoCenter: true })
    });
    const textData = await textRes.json();
    assert.equal(textData.success, true);
    assert.equal(textData.grid.length, 7);
    assert.equal(textData.grid[0].length, 53);

    // 3. POST /api/plan-summary
    const planRes = await fetch(`${baseUrl}/api/plan-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grid: textData.grid, year: 2024 })
    });
    const planData = await planRes.json();
    assert.equal(planData.success, true);
    assert.ok(planData.summary.totalCommits > 0);

    // 4. POST /api/execute (dry-run)
    const execRes = await fetch(`${baseUrl}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grid: textData.grid, year: 2024, dryRun: true })
    });
    const execData = await execRes.json();
    assert.equal(execData.success, true);
    assert.equal(execData.result.dryRun, true);
    assert.ok(execData.result.totalCommits > 0);
    // 5. GET /api/eligibility
    const elRes = await fetch(`${baseUrl}/api/eligibility`);
    const elData = await elRes.json();
    assert.equal(elRes.status, 200);
    assert.equal(elData.success, true);
    assert.ok(Array.isArray(elData.audit.checks));

    // 6. POST /api/detect-gaps
    const gapsRes = await fetch(`${baseUrl}/api/detect-gaps`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: 2024 })
    });
    const gapsData = await gapsRes.json();
    assert.equal(gapsRes.status, 200);
    assert.equal(gapsData.success, true);
    assert.ok(gapsData.gaps.totalCalendarDays > 0);
    // 7. GET /api/render-signature
    const sigRes = await fetch(`${baseUrl}/api/render-signature?text=CodeByArnob`);
    const sigData = await sigRes.json();
    assert.equal(sigRes.status, 200);
    assert.equal(sigData.success, true);
    assert.equal(sigData.text, "CodeByArnob");
    assert.equal(sigData.rows, 7);
    assert.ok(sigData.cols > 40);
  } finally {
    await stopTestServer(server);
  }
});
