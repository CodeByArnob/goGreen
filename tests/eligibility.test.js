import test from "node:test";
import assert from "node:assert/strict";
import dayjs from "dayjs";
import {
  auditContributionEligibility,
  validateCommitDates
} from "../src/core/eligibility.js";

test("eligibility: auditContributionEligibility reports valid checks on current repo", async () => {
  const audit = await auditContributionEligibility();

  assert.ok(audit.checks.length >= 3, "Must perform email, branch, and remote checks");
  assert.equal(typeof audit.isEligible, "boolean");

  const emailCheck = audit.checks.find(c => c.name === "Commit Author Email");
  assert.ok(emailCheck, "Must have an author email check");
  assert.equal(typeof emailCheck.passed, "boolean");

  const branchCheck = audit.checks.find(c => c.name === "Target Branch");
  assert.ok(branchCheck, "Must have a branch check");
});

test("eligibility: validateCommitDates catches future dates", () => {
  const tomorrow = dayjs().add(1, "day").format("YYYY-MM-DD");
  const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

  const planWithFuture = [
    { date: yesterday, commitCount: 1 },
    { date: tomorrow, commitCount: 1 }
  ];

  const validation = validateCommitDates(planWithFuture);
  assert.equal(validation.valid, false);
  assert.equal(validation.futureCommitsCount, 1);
  assert.ok(validation.futureDates.includes(tomorrow));

  const planPastOnly = [
    { date: yesterday, commitCount: 1 }
  ];
  const validationPast = validateCommitDates(planPastOnly);
  assert.equal(validationPast.valid, true);
  assert.equal(validationPast.futureCommitsCount, 0);
});
