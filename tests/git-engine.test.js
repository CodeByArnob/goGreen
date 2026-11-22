import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyRemoteSafety,
  executeCommitPlan,
  inspectGitState
} from "../src/core/git-engine.js";

test("git-engine: verifyRemoteSafety prevents pushing to upstream original repo", () => {
  const unsafeRemotes = [
    {
      name: "origin",
      refs: {
        fetch: "https://github.com/fenrir2608/goGreen.git",
        push: "https://github.com/fenrir2608/goGreen.git"
      }
    }
  ];

  assert.throws(
    () => verifyRemoteSafety(unsafeRemotes),
    /Safety violation: origin remote points to original repository/
  );
});

test("git-engine: verifyRemoteSafety permits pushing to user's fork", () => {
  const safeRemotes = [
    {
      name: "origin",
      refs: {
        fetch: "https://github.com/CodeByArnob/goGreen.git",
        push: "https://github.com/CodeByArnob/goGreen.git"
      }
    },
    {
      name: "upstream",
      refs: {
        fetch: "https://github.com/fenrir2608/goGreen.git",
        push: "https://github.com/fenrir2608/goGreen.git"
      }
    }
  ];

  assert.doesNotThrow(() => verifyRemoteSafety(safeRemotes));
});

test("git-engine: inspectGitState identifies current repo", async () => {
  const state = await inspectGitState();
  assert.equal(state.isRepo, true);
  assert.ok(state.currentBranch, "Must report a current branch");
  assert.ok(Array.isArray(state.remotes), "Must report remotes array");
});

test("git-engine: executeCommitPlan in dry-run mode simulates without altering git", async () => {
  const samplePlan = [
    { date: "2024-03-01", formattedDate: "2024-03-01T12:00:00Z", commitCount: 3, level: 2 },
    { date: "2024-03-02", formattedDate: "2024-03-02T12:00:00Z", commitCount: 5, level: 3 }
  ];

  let progressCalled = false;
  const result = await executeCommitPlan(samplePlan, {
    dryRun: true,
    onProgress: status => {
      progressCalled = true;
      assert.equal(status.total, 8);
    }
  });

  assert.equal(result.success, true);
  assert.equal(result.dryRun, true);
  assert.equal(result.totalCommits, 8);
  assert.equal(result.activeDays, 2);
  assert.equal(result.pushed, false);
  assert.equal(progressCalled, true);
});
