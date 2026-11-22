import test from "node:test";
import assert from "node:assert/strict";
import { generatePrePublishReport } from "../src/core/commit-reviewer.js";

test("commit-reviewer: generatePrePublishReport provides complete audit metadata", () => {
  const plan = [
    { date: "2024-05-01", commitCount: 1, level: 1 },
    { date: "2024-05-02", commitCount: 4, level: 2 }
  ];

  const mockAudit = {
    isEligible: true,
    checks: [
      { name: "Author Email", passed: true, value: "test@example.com", details: "ok" },
      { name: "Branch", passed: true, value: "main", details: "ok" }
    ],
    warnings: [],
    summary: { gitUserEmail: "test@example.com", currentBranch: "main" }
  };

  const report = generatePrePublishReport(plan, mockAudit);

  assert.equal(report.totalCommits, 5);
  assert.equal(report.activeDays, 2);
  assert.equal(report.firstDate, "2024-05-01");
  assert.equal(report.lastDate, "2024-05-02");
  assert.ok(report.disclaimer.includes("GitHub Contribution Rules"));
  assert.equal(report.dateValidation.valid, true);
});
