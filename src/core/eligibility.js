/**
 * goGreen GitHub Contribution Eligibility & Audit Engine
 * Analyzes repository, commit identity, and branch configuration against official GitHub rules.
 *
 * Official GitHub Contribution Eligibility Rules:
 * 1. The commit author email MUST match an email associated with the GitHub account (including noreply).
 * 2. The commit MUST be on the repository's default branch (or gh-pages branch).
 * 3. Commits in a fork do NOT count on profile graphs by default unless:
 *    - The commit is merged into upstream via PR, OR
 *    - The fork is detached / converted into a standalone repository, OR
 *    - The user has configured profile visibility settings.
 * 4. Commits with future timestamps are not counted on the contribution graph until that date arrives.
 */

import { simpleGit } from "simple-git";
import dayjs from "dayjs";

/**
 * Runs a comprehensive GitHub contribution eligibility audit.
 * @param {Object} [options]
 * @param {string} [options.workingDir=process.cwd()]
 * @param {string} [options.authenticatedUser="CodeByArnob"]
 * @returns {Promise<Object>}
 */
export async function auditContributionEligibility(options = {}) {
  const workingDir = options.workingDir || process.cwd();
  const git = simpleGit(workingDir);

  const checks = [];
  const warnings = [];
  let isEligible = true;

  // 1. Check Git config user.name and user.email
  let gitUserName = "";
  let gitUserEmail = "";
  try {
    gitUserName = (await git.raw(["config", "user.name"])).trim();
    gitUserEmail = (await git.raw(["config", "user.email"])).trim();
  } catch (_) {}

  if (!gitUserEmail) {
    isEligible = false;
    checks.push({
      name: "Commit Author Email",
      passed: false,
      value: "Not configured",
      details: "git config user.email is missing. GitHub will not associate commits with any account."
    });
  } else {
    // Check if email matches expected user format (either standard email or ID+username@users.noreply.github.com)
    const isNoreply = gitUserEmail.includes("users.noreply.github.com");
    checks.push({
      name: "Commit Author Email",
      passed: true,
      value: gitUserEmail,
      details: isNoreply
        ? "GitHub noreply format detected. Commits will be linked to your account while preserving privacy."
        : "Custom email configured. Ensure this exact email address is verified under GitHub Account Settings -> Emails."
    });
  }

  // 2. Check current and default branch
  let currentBranch = "main";
  try {
    const branchSummary = await git.branch();
    currentBranch = branchSummary.current;
  } catch (_) {}

  const isDefaultBranch = currentBranch === "main" || currentBranch === "master";
  if (!isDefaultBranch) {
    warnings.push(
      `Current branch is "${currentBranch}". GitHub contribution calendars ONLY reflect commits on the default branch (main/master). Commits on this branch will only count once merged.`
    );
    checks.push({
      name: "Target Branch",
      passed: false,
      value: currentBranch,
      details: "Must be 'main' (or default branch) for contributions to count immediately without PR merge."
    });
  } else {
    checks.push({
      name: "Target Branch",
      passed: true,
      value: currentBranch,
      details: "Default branch confirmed. Commits here count directly toward your contribution graph."
    });
  }

  // 3. Inspect remotes and fork status
  let originUrl = "";
  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find(r => r.name === "origin");
    if (origin) {
      originUrl = origin.refs.push || origin.refs.fetch || "";
    }
  } catch (_) {}

  checks.push({
    name: "Origin Remote",
    passed: Boolean(originUrl),
    value: originUrl || "None",
    details: originUrl ? "Target remote origin is configured." : "No origin remote found."
  });

  // Check fork characteristics
  const isFork = originUrl.toLowerCase().includes("gogreen") && !originUrl.toLowerCase().includes("standalone");
  if (isFork) {
    warnings.push(
      "GitHub Contribution Policy Notice: GitHub does not count commits in a fork toward your profile graph by default unless either: (1) You create a PR that is merged into the parent repo, (2) The repository is standalone/detached, or (3) Fork contributions are explicitly tracked. For a guaranteed personal green graph, use a standalone repository under your account."
    );
  }

  // 4. Verification rules
  return {
    isEligible: isEligible && isDefaultBranch,
    checks,
    warnings,
    summary: {
      gitUserName,
      gitUserEmail,
      currentBranch,
      originUrl,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Validates planned commit dates for future-date compliance.
 * @param {Array<{ date: string }>} plan
 * @returns {{ valid: boolean, futureCommitsCount: number, futureDates: string[] }}
 */
export function validateCommitDates(plan) {
  const today = dayjs().endOf("day");
  const futureDates = [];

  plan.forEach(item => {
    const commitDate = dayjs(item.date);
    if (commitDate.isAfter(today)) {
      futureDates.push(item.date);
    }
  });

  return {
    valid: futureDates.length === 0,
    futureCommitsCount: futureDates.length,
    futureDates
  };
}
