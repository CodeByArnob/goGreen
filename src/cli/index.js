/**
 * goGreen Command Line Interface Entry
 * Powered by Commander.js.
 */

import { Command } from "commander";
import chalk from "chalk";
import { textToGrid } from "../core/font.js";
import { generatePatternGrid, listAvailablePatterns } from "../core/patterns.js";
import { getCalendarStartDate, gridToCommitPlan } from "../core/calendar.js";
import { renderGrid, printPlanSummary } from "./visualizer.js";
import { executeCommitPlan } from "../core/git-engine.js";
import { auditContributionEligibility } from "../core/eligibility.js";
import { detectContributionGaps, generateGapFillPlan, scanHistoricalYears } from "../core/gap-detector.js";
import { generatePrePublishReport, printTerminalReview } from "../core/commit-reviewer.js";
import { runInteractiveWizard } from "./prompt.js";

const program = new Command();

program
  .name("gogreen")
  .description("🌱 Modern, safe tool to audit, detect gaps, and design genuine-compliant GitHub contribution graph activity.")
  .version("2.1.0");

/**
 * Common execution helper for CLI subcommands with pre-publish review
 */
async function executeCliPlan(grid, opts) {
  const calOpts = opts.year ? { year: parseInt(opts.year, 10) } : {};
  const startDate = getCalendarStartDate(calOpts);
  const plan = gridToCommitPlan(grid, { startDate });

  console.log(chalk.bold("\n📅 GitHub Contribution Graph Preview:\n"));
  console.log(renderGrid(grid, { startDate }));
  printPlanSummary(plan, { dryRun: opts.dryRun });

  // Pre-publish eligibility audit & review
  const eligibilityAudit = await auditContributionEligibility();
  const reviewReport = generatePrePublishReport(plan, eligibilityAudit);
  printTerminalReview(reviewReport);

  if (opts.previewOnly) {
    console.log(chalk.cyan("Preview mode only. No changes applied."));
    return;
  }

  const result = await executeCommitPlan(plan, {
    dryRun: Boolean(opts.dryRun),
    push: Boolean(opts.push),
    branch: opts.branch,
    commitMessage: opts.message,
    onProgress: status => {
      if (status.percent % 25 === 0) {
        process.stdout.write(`\r${chalk.dim("Committing:")} ${chalk.green(`${status.percent}%`)} (${status.current}/${status.total})`);
      }
    }
  });

  if (result.dryRun) {
    console.log(chalk.bold.yellow("\n⚡ Dry-run finished. No Git commits created."));
    console.log(chalk.dim("Remove the --dry-run flag to apply commits locally."));
  } else {
    console.log(chalk.bold.green(`\n✔ Created ${result.totalCommits} commits on branch '${result.branch}'.`));
    if (result.pushed) {
      console.log(chalk.bold.green("✔ Pushed to remote origin."));
    } else {
      console.log(chalk.dim("💡 To update your GitHub profile, run: git push"));
    }
  }
}

// 1. Audit / Eligibility Command
program
  .command("audit")
  .alias("check-eligibility")
  .description("Verify GitHub author email, repository ownership, default branch, and contribution eligibility")
  .action(async () => {
    try {
      console.log(chalk.bold.cyan("\n🔍 Running GitHub Contribution Eligibility Audit...\n"));
      const audit = await auditContributionEligibility();

      console.log(chalk.bold("Checks:"));
      audit.checks.forEach(c => {
        const symbol = c.passed ? chalk.green("✔") : chalk.red("✖");
        console.log(`  ${symbol} ${chalk.bold(c.name)}: ${c.value}`);
        console.log(chalk.dim(`    ${c.details}`));
      });

      if (audit.warnings.length > 0) {
        console.log(chalk.bold.yellow("\n⚠️  Warnings & Notices:"));
        audit.warnings.forEach(w => console.log(chalk.yellow(`  • ${w}`)));
      }

      console.log(chalk.bold(`\nOverall Eligibility: ${audit.isEligible ? chalk.green("ELIGIBLE (Default Branch & Email Configured)") : chalk.red("ATTENTION REQUIRED")}\n`));
    } catch (err) {
      console.error(chalk.red(`Audit Error: ${err.message}`));
      process.exit(1);
    }
  });

// 2. Gaps Detection Command
program
  .command("gaps")
  .alias("detect-gaps")
  .description("Scan contribution calendar to identify inactive days (gaps) and optionally generate fill plans")
  .option("-y, --year <year>", "Specific calendar year to analyze (e.g. 2024)")
  .option("-u, --user <username>", "Target GitHub username", "CodeByArnob")
  .option("--all-years", "Scan all historical years (2023, 2024, 2025, 2026)", false)
  .option("--local", "Force scan local repository Git history only instead of live GitHub", false)
  .option("--fill", "Generate a commit plan to fill identified gap days", false)
  .option("-i, --intensity <level>", "Green shade level for gap fills (1-4)", "1")
  .option("-d, --dry-run", "Simulate without committing or altering Git", true)
  .option("-p, --push", "Automatically push to remote repository", false)
  .action(async opts => {
    try {
      if (opts.allYears) {
        console.log(chalk.bold.cyan(`\n📊 Scanning All Historical Years for @${opts.user}...\n`));
        const allReports = await scanHistoricalYears(opts.user, [2023, 2024, 2025, 2026]);

        console.log(chalk.bold("┌──────┬──────────────┬──────────────┬──────────────┬──────────────┬────────────┐"));
        console.log(chalk.bold("│ Year │ Total Contrib│ Active Days  │ Gap Days (0) │ Active %     │ Data Source│"));
        console.log(chalk.bold("├──────┼──────────────┼──────────────┼──────────────┼──────────────┼────────────┤"));

        allReports.forEach(r => {
          const yearStr = String(r.year).padEnd(4);
          const totalStr = String(r.totalContributions).padStart(12);
          const activeStr = String(r.activeDays).padStart(12);
          const gapStr = String(r.gapDays).padStart(12);
          const pctStr = `${r.percentActive}%`.padStart(10);
          const srcStr = r.dataSource === "github-live-graphql" ? chalk.green("Live GraphQL") : chalk.yellow("Local Git");
          console.log(`│ ${yearStr} │ ${totalStr} │ ${chalk.green(activeStr)} │ ${chalk.red(gapStr)} │ ${pctStr}   │ ${srcStr.padEnd(10)} │`);
        });
        console.log(chalk.bold("└──────┴──────────────┴──────────────┴──────────────┴──────────────┴────────────┘\n"));
        return;
      }

      console.log(chalk.bold.cyan("\n📊 Analyzing Contribution Gaps...\n"));
      const calOpts = {
        year: opts.year ? parseInt(opts.year, 10) : undefined,
        username: opts.user,
        preferLive: !opts.local
      };
      const gapsData = await detectContributionGaps(calOpts);

      console.log(`  • Target User:    ${chalk.bold.cyan(`@${opts.user}`)}`);
      console.log(`  • Year / Scope:   ${chalk.bold(gapsData.year)}`);
      console.log(`  • Data Source:    ${gapsData.dataSource === "github-live-graphql" ? chalk.green.bold("Live GitHub GraphQL API") : chalk.yellow.bold("Local Git History")}`);
      console.log(`  • Total Contrib:  ${chalk.bold.green(gapsData.totalContributions)}`);
      console.log(`  • Analyzed Days:  ${chalk.bold(gapsData.totalCalendarDays)}`);
      console.log(`  • Active Days:    ${chalk.green.bold(gapsData.activeDays)} (${gapsData.percentActive}%)`);
      console.log(`  • Gap Days (0):   ${chalk.red.bold(gapsData.gapDays)}`);

      if (opts.fill) {
        console.log(chalk.bold("\nFilling identified gap days:"));
        const fillGrid = gapsData.gapGrid.map(row => row.map(cell => (cell > 0 ? parseInt(opts.intensity, 10) : 0)));
        await executeCliPlan(fillGrid, opts);
      } else {
        console.log(chalk.dim("\nTip: Run with `--fill --dry-run` to generate a preview plan to fill these gaps."));
      }
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// 3. Text command
program
  .command("text <string>")
  .description("Write custom text or words on your contribution graph")
  .option("-i, --intensity <level>", "Green shade level (1-4)", "4")
  .option("-y, --year <year>", "Specific calendar year (e.g. 2024)")
  .option("--no-center", "Do not auto-center the text horizontally")
  .option("-s, --spacing <columns>", "Spacing between characters", "1")
  .option("-d, --dry-run", "Simulate without committing or altering Git", false)
  .option("-p, --push", "Automatically push to remote repository", false)
  .option("-b, --branch <branch>", "Target Git branch")
  .option("-m, --message <msg>", "Commit message template")
  .option("--preview-only", "Show grid preview only and exit", false)
  .action(async (str, opts) => {
    try {
      const intensity = parseInt(opts.intensity, 10);
      const spacing = parseInt(opts.spacing, 10);
      const grid = textToGrid(str, {
        intensity,
        autoCenter: opts.center,
        spacing
      });
      await executeCliPlan(grid, opts);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// 4. Pattern command
program
  .command("pattern [name]")
  .description("Draw preset pixel art patterns (heart, space-invader, pacman, etc.)")
  .option("-l, --list", "List all available preset patterns", false)
  .option("-i, --intensity <level>", "Green shade level (1-4)", "4")
  .option("-y, --year <year>", "Specific calendar year (e.g. 2024)")
  .option("-d, --dry-run", "Simulate without committing or altering Git", false)
  .option("-p, --push", "Automatically push to remote repository", false)
  .option("-b, --branch <branch>", "Target Git branch")
  .option("-m, --message <msg>", "Commit message template")
  .option("--preview-only", "Show grid preview only and exit", false)
  .action(async (name, opts) => {
    try {
      if (opts.list || !name) {
        console.log(chalk.bold("\nAvailable Preset Patterns:"));
        listAvailablePatterns().forEach(pat => {
          console.log(`  ${chalk.green("•")} ${chalk.cyan(pat)}`);
        });
        console.log(chalk.dim("\nUsage: gogreen pattern <name> --dry-run\n"));
        return;
      }

      const intensity = parseInt(opts.intensity, 10);
      const grid = generatePatternGrid(name, { intensity });
      await executeCliPlan(grid, opts);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// 5. Realistic / Random activity command
program
  .command("realistic")
  .alias("random")
  .description("Generate realistic human developer activity (Mon-Fri bursts, weekend dips)")
  .option("-c, --days <count>", "Target number of active contribution days (1-365)", "160")
  .option("-y, --year <year>", "Specific calendar year (e.g. 2024)")
  .option("-d, --dry-run", "Simulate without committing or altering Git", false)
  .option("-p, --push", "Automatically push to remote repository", false)
  .option("-b, --branch <branch>", "Target Git branch")
  .option("-m, --message <msg>", "Commit message template")
  .option("--preview-only", "Show grid preview only and exit", false)
  .action(async opts => {
    try {
      const targetDays = parseInt(opts.days, 10);
      const grid = generatePatternGrid("realistic", { targetDays });
      await executeCliPlan(grid, opts);
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// 6. Web designer command
program
  .command("web")
  .description("Launch the interactive Web UI contribution grid designer in your browser")
  .option("--port <port>", "Port number for web server", "3300")
  .option("--no-open", "Do not open browser automatically")
  .action(async opts => {
    try {
      const { startWebServer } = await import("../web/server.js");
      await startWebServer({
        port: parseInt(opts.port, 10),
        openBrowser: opts.open
      });
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// 7. Wizard command
program
  .command("wizard")
  .description("Launch guided interactive terminal wizard")
  .action(async () => {
    try {
      await runInteractiveWizard();
    } catch (err) {
      console.error(chalk.red(`Error: ${err.message}`));
      process.exit(1);
    }
  });

// Default root action: if no args passed, launch wizard
if (process.argv.length <= 2) {
  runInteractiveWizard().catch(err => {
    console.error(chalk.red(`Error: ${err.message}`));
    process.exit(1);
  });
} else {
  program.parse(process.argv);
}
