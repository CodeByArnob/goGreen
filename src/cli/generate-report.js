/**
 * goGreen Automated Contribution Audit Report Generator
 * Generates an executive Markdown report of eligibility and contribution gaps across all years.
 * Safe for scheduled unattended execution in CI / GitHub Actions (read-only audit).
 */

import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import { auditContributionEligibility } from "../core/eligibility.js";
import { scanHistoricalYears } from "../core/gap-detector.js";

/**
 * Generates Markdown audit report.
 * @param {Object} options
 * @param {string} [options.username="CodeByArnob"]
 * @param {number[]} [options.years=[2023, 2024, 2025, 2026]]
 * @returns {Promise<string>} Markdown report text
 */
export async function generateAuditMarkdownReport(options = {}) {
  const username = options.username || "CodeByArnob";
  const years = options.years || [2023, 2024, 2025, 2026];

  const eligibility = await auditContributionEligibility();
  const yearReports = await scanHistoricalYears(username, years);

  const timestamp = new Date().toISOString();
  const dhakaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

  let md = `# 🌱 goGreen Weekly Contribution & Eligibility Audit Report\n\n`;
  md += `**Target GitHub User:** @${username}  \n`;
  md += `**Execution Timestamp:** ${timestamp} (UTC) | ${dhakaTime} (Asia/Dhaka)  \n`;
  md += `**Status:** ${eligibility.isEligible ? "✅ ELIGIBLE FOR CONTRIBUTIONS" : "⚠️ ATTENTION REQUIRED"}  \n\n`;
  md += `> **Safety Notice:** This is an automated read-only audit. No commits or repositories were modified.\n\n`;
  md += `---\n\n`;

  // Section 1: Contribution Eligibility Checklist
  md += `## 1. 🛡️ Contribution Eligibility Checklist\n\n`;
  md += `| Check | Status | Configured Value | Rule Details |\n`;
  md += `| :--- | :---: | :--- | :--- |\n`;
  eligibility.checks.forEach(c => {
    const symbol = c.passed ? "✅ Pass" : "❌ Fail";
    md += `| ${c.name} | ${symbol} | \`${c.value}\` | ${c.details} |\n`;
  });
  md += `\n`;

  if (eligibility.warnings.length > 0) {
    md += `### ⚠️ Policy Notices\n`;
    eligibility.warnings.forEach(w => {
      md += `- ${w}\n`;
    });
    md += `\n`;
  }

  // Section 2: Historical Gap Analysis
  md += `## 2. 📊 Multi-Year Contribution Gap Analysis\n\n`;
  md += `| Calendar Year | Total Contributions | Active Days | Inactive Gaps (0) | Active % | Data Source |\n`;
  md += `| :---: | :---: | :---: | :---: | :---: | :---: |\n`;
  yearReports.forEach(r => {
    md += `| **${r.year}** | ${r.totalContributions} | ${r.activeDays} | **${r.gapDays}** | ${r.percentActive}% | ${r.dataSource} |\n`;
  });
  md += `\n`;

  // Section 3: Safe Recommendations
  md += `## 3. 💡 Recommended Next Actions\n\n`;
  md += `1. **Review Gaps Locally**: Run \`node bin/gogreen.js gaps --year 2024\` to inspect inactive dates.\n`;
  md += `2. **Visual Studio Preview**: Run \`npm run web\` to interactively design any desired gap fills.\n`;
  md += `3. **Standalone Export**: If desired to count 100% toward public GitHub graphs without fork restrictions, consider maintaining commits on a standalone repository under your account.\n`;
  md += `4. **Pre-Publish Review**: Always review planned author email, default branch, and date validation before applying commits.\n`;

  return md;
}

/**
 * CLI execution entrypoint
 */
export async function runReportCli() {
  console.log(chalk.bold.cyan("\n🌱 Running Weekly Contribution Audit Report Generator...\n"));

  const mdReport = await generateAuditMarkdownReport();

  // Print summary to terminal
  console.log(mdReport);

  // If running inside GitHub Actions, write to step summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      await fs.appendFile(process.env.GITHUB_STEP_SUMMARY, mdReport, "utf8");
      console.log(chalk.green("✔ Written report to GITHUB_STEP_SUMMARY."));
    } catch (err) {
      console.warn("Could not write to GITHUB_STEP_SUMMARY:", err.message);
    }
  }

  // Write to AUDIT_REPORT.md in repo root
  const reportPath = path.resolve(process.cwd(), "AUDIT_REPORT.md");
  await fs.writeFile(reportPath, mdReport, "utf8");
  console.log(chalk.green(`✔ Saved latest audit report to: ${reportPath}`));

  // Preserve historical audit result in audits/ directory
  try {
    const auditsDir = path.resolve(process.cwd(), "audits");
    await fs.mkdir(auditsDir, { recursive: true });

    const dateStr = new Date().toISOString().split("T")[0];
    const historicalPath = path.join(auditsDir, `audit-${dateStr}.md`);
    await fs.writeFile(historicalPath, mdReport, "utf8");

    // Update historical index log in audits/HISTORY.md
    const historyLogPath = path.join(auditsDir, "HISTORY.md");
    const logLine = `- **${dateStr}** — [Audit Report](audit-${dateStr}.md) (Generated at ${new Date().toISOString()})\n`;
    let existingHistory = "# 📜 Historical Contribution Audit Log\n\n";
    try {
      existingHistory = await fs.readFile(historyLogPath, "utf8");
      if (!existingHistory.includes(`audit-${dateStr}.md`)) {
        existingHistory += logLine;
      }
    } catch (_) {
      existingHistory += logLine;
    }
    await fs.writeFile(historyLogPath, existingHistory, "utf8");
    console.log(chalk.green(`✔ Preserved historical audit archive in: ${historicalPath}\n`));
  } catch (err) {
    console.warn("Could not save historical audit archive:", err.message);
  }
}

if (process.argv[1] && process.argv[1].endsWith("generate-report.js")) {
  runReportCli().catch(err => {
    console.error(chalk.red("Audit report failed:", err.message));
    process.exit(1);
  });
}
