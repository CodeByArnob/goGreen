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
import { runInteractiveWizard } from "./prompt.js";

const program = new Command();

program
  .name("gogreen")
  .description("🌱 Modern, safe tool to draw pixel art, text, and realistic activity on your GitHub contribution graph.")
  .version("2.0.0");

/**
 * Common execution helper for CLI subcommands
 */
async function executeCliPlan(grid, opts) {
  const calOpts = opts.year ? { year: parseInt(opts.year, 10) } : {};
  const startDate = getCalendarStartDate(calOpts);
  const plan = gridToCommitPlan(grid, { startDate });

  console.log(chalk.bold("\n📅 GitHub Contribution Graph Preview:\n"));
  console.log(renderGrid(grid, { startDate }));
  printPlanSummary(plan, { dryRun: opts.dryRun });

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

// 1. Text command
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

// 2. Pattern command
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

// 3. Realistic / Random activity command
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

// 4. Web designer command
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

// 5. Wizard command
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
