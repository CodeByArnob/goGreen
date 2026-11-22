/**
 * goGreen Safe Git Execution Engine
 * Manages atomic commits, date spoofing, dry-runs, safeguards, and progress tracking.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { simpleGit } from "simple-git";
import { DEFAULT_DATA_PATH } from "./config.js";

/**
 * Validates the local Git repository state and remote targets.
 * @param {string} [workingDir=process.cwd()]
 * @returns {Promise<{ isRepo: boolean, currentBranch: string, remotes: Array<{ name: string, refs: object }> }>}
 */
export async function inspectGitState(workingDir = process.cwd()) {
  const git = simpleGit(workingDir);
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error(`Directory "${workingDir}" is not a Git repository.`);
  }

  const branchSummary = await git.branch();
  const remotes = await git.getRemotes(true);

  return {
    isRepo: true,
    currentBranch: branchSummary.current,
    remotes
  };
}

/**
 * Checks if the remote origin is safe to push to (ensures not pushing to original author repo).
 * @param {Array} remotes
 * @param {string} [forbiddenSubstring="fenrir2608/goGreen"]
 */
export function verifyRemoteSafety(remotes, forbiddenSubstring = "fenrir2608/goGreen") {
  const origin = remotes.find(r => r.name === "origin");
  if (origin) {
    const pushUrl = origin.refs.push || origin.refs.fetch || "";
    if (pushUrl.toLowerCase().includes(forbiddenSubstring.toLowerCase())) {
      throw new Error(`Safety violation: origin remote points to original repository "${pushUrl}". Refusing to push.`);
    }
  }
}

/**
 * Executes a planned set of commits against a target repository.
 *
 * @param {Array<{ date: string, formattedDate: string, commitCount: number, level: number }>} plan
 * @param {Object} [options]
 * @param {boolean} [options.dryRun=false] - If true, simulates all operations without writing or committing
 * @param {boolean} [options.push=false] - If true, pushes committed changes to remote origin
 * @param {string} [options.branch] - Target branch (default: current branch)
 * @param {string} [options.dataFile=DEFAULT_DATA_PATH] - File modified to produce commit diffs
 * @param {string} [options.commitMessage] - Custom commit message template
 * @param {string} [options.workingDir=process.cwd()]
 * @param {Function} [options.onProgress] - Callback `(status) => void`
 * @returns {Promise<Object>} Execution result summary
 */
export async function executeCommitPlan(plan, options = {}) {
  const {
    dryRun = false,
    push = false,
    dataFile = DEFAULT_DATA_PATH,
    workingDir = process.cwd(),
    commitMessage = "🌱 goGreen contribution update",
    onProgress
  } = options;

  // Flatten the plan into individual commits
  const flattenedCommits = [];
  plan.forEach(item => {
    for (let i = 0; i < item.commitCount; i++) {
      // Stagger times during the day (e.g. 09:00, 11:30, 14:15, 17:45)
      const hour = 9 + Math.floor((i * 3.5) % 12);
      const minute = (i * 17) % 60;
      const second = (i * 29) % 60;
      const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
      const isoWithTime = `${item.date}T${timeStr}`;

      flattenedCommits.push({
        date: item.date,
        isoDate: isoWithTime,
        index: flattenedCommits.length + 1,
        level: item.level
      });
    }
  });

  const total = flattenedCommits.length;

  if (dryRun) {
    if (onProgress) {
      onProgress({
        current: total,
        total,
        percent: 100,
        status: "dry-run complete",
        isoDate: flattenedCommits.length > 0 ? flattenedCommits[flattenedCommits.length - 1].isoDate : null
      });
    }

    return {
      success: true,
      dryRun: true,
      totalCommits: total,
      activeDays: plan.length,
      firstDate: plan.length > 0 ? plan[0].date : null,
      lastDate: plan.length > 0 ? plan[plan.length - 1].date : null,
      pushed: false
    };
  }

  // Live execution mode:
  const gitState = await inspectGitState(workingDir);

  if (push) {
    verifyRemoteSafety(gitState.remotes);
  }

  const git = simpleGit(workingDir);
  const targetBranch = options.branch || gitState.currentBranch;

  // If a specific non-current branch was requested, checkout or create it
  if (options.branch && options.branch !== gitState.currentBranch) {
    const branches = await git.branchLocal();
    if (branches.all.includes(options.branch)) {
      await git.checkout(options.branch);
    } else {
      await git.checkoutLocalBranch(options.branch);
    }
  }

  const resolvedDataPath = path.resolve(workingDir, dataFile);

  // Execute commits sequentially
  for (let idx = 0; idx < total; idx++) {
    const item = flattenedCommits[idx];

    const dataPayload = {
      project: "goGreen",
      timestamp: item.isoDate,
      commitIndex: item.index,
      totalPlanned: total
    };

    // Write updated content to tracking file
    await fs.writeFile(resolvedDataPath, JSON.stringify(dataPayload, null, 2), "utf8");

    // Commit with matching author and committer dates
    const gitWithEnv = simpleGit(workingDir).env({
      ...process.env,
      GIT_AUTHOR_DATE: item.isoDate,
      GIT_COMMITTER_DATE: item.isoDate
    });

    const msg = `${commitMessage} (${item.index}/${total})`;
    await gitWithEnv.add([resolvedDataPath]);
    await gitWithEnv.commit(msg, [resolvedDataPath], {
      "--date": item.isoDate
    });

    if (onProgress) {
      onProgress({
        current: idx + 1,
        total,
        percent: Math.round(((idx + 1) / total) * 100),
        isoDate: item.isoDate,
        date: item.date
      });
    }
  }

  let pushed = false;
  if (push) {
    await git.push("origin", targetBranch);
    pushed = true;
  }

  return {
    success: true,
    dryRun: false,
    totalCommits: total,
    activeDays: plan.length,
    branch: targetBranch,
    pushed
  };
}
