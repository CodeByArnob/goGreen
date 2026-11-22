/**
 * goGreen Pre-Publish Commit Reviewer & Transparency Engine
 * Formats detailed audit reviews and enforces verification before commits are published.
 */

import chalk from "chalk";
import dayjs from "dayjs";
import { validateCommitDates } from "./eligibility.js";

/**
 * Generates structured pre-publish review metadata.
 * @param {Array} plan
 * @param {Object} eligibilityAudit
 * @returns {Object}
 */
export function generatePrePublishReport(plan, eligibilityAudit) {
  const dateValidation = validateCommitDates(plan);
  const totalCommits = plan.reduce((sum, item) => sum + item.commitCount, 0);

  const sampleCommits = plan.slice(0, 5).map(item => ({
    date: item.date,
    commits: item.commitCount,
    level: item.level
  }));

  return {
    totalCommits,
    activeDays: plan.length,
    firstDate: plan.length > 0 ? plan[0].date : null,
    lastDate: plan.length > 0 ? plan[plan.length - 1].date : null,
    dateValidation,
    eligibilityAudit,
    sampleCommits,
    disclaimer: "GitHub Contribution Rules Notice: Commits will reflect on your profile only if authored by an email attached to your GitHub account and committed to the default branch of a standalone repository (or merged PR). Artificial activity is never guaranteed to count as genuine contributions."
  };
}

/**
 * Prints the pre-publish review to terminal.
 * @param {Object} report
 */
export function printTerminalReview(report) {
  console.log(chalk.bold("\n" + "=".repeat(64)));
  console.log(chalk.bold.cyan("🛡️  PRE-PUBLISH CONTRIBUTION AUDIT & REVIEW"));
  console.log(chalk.bold("=".repeat(64)));

  // 1. Author and Eligibility Checklist
  console.log(chalk.bold("\n1. Identity & Eligibility Checklist:"));
  report.eligibilityAudit.checks.forEach(check => {
    const symbol = check.passed ? chalk.green("✔") : chalk.red("✖");
    console.log(`  ${symbol} ${chalk.bold(check.name)}: ${check.value}`);
    console.log(chalk.dim(`    ${check.details}`));
  });

  // 2. Warnings
  if (report.eligibilityAudit.warnings.length > 0) {
    console.log(chalk.bold.yellow("\n⚠️  Eligibility Warnings:"));
    report.eligibilityAudit.warnings.forEach(warn => {
      console.log(chalk.yellow(`  • ${warn}`));
    });
  }

  // 3. Date Validation & Future-Date Guard
  console.log(chalk.bold("\n2. Date Validation & Compliance:"));
  if (!report.dateValidation.valid) {
    console.log(chalk.red(`  ✖ WARNING: ${report.dateValidation.futureCommitsCount} commits are scheduled for future dates!`));
    console.log(chalk.dim("    GitHub does not display future-dated commits on the contribution graph until those dates occur."));
  } else {
    console.log(chalk.green("  ✔ All planned commits are in the past or present. No future dates detected."));
  }

  // 4. Execution Metrics
  console.log(chalk.bold("\n3. Commit Scope:"));
  console.log(`  • Planned Commits: ${chalk.bold.green(report.totalCommits)}`);
  console.log(`  • Active Days:     ${chalk.bold.yellow(report.activeDays)}`);
  console.log(`  • Date Range:      ${report.firstDate} → ${report.lastDate}`);

  // 5. Official Disclaimer
  console.log(chalk.bold("\n4. Transparency & Disclaimer:"));
  console.log(chalk.dim(`  "${report.disclaimer}"`));
  console.log(chalk.bold("=".repeat(64) + "\n"));
}
