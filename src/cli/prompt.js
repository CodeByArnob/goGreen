/**
 * goGreen Interactive Terminal Wizard
 * Step-by-step guided setup using Inquirer.
 */

import inquirer from "inquirer";
import chalk from "chalk";
import { textToGrid } from "../core/font.js";
import { generatePatternGrid, listAvailablePatterns } from "../core/patterns.js";
import { getCalendarStartDate, gridToCommitPlan } from "../core/calendar.js";
import { renderGrid, printPlanSummary } from "./visualizer.js";
import { executeCommitPlan } from "../core/git-engine.js";

/**
 * Runs the interactive CLI wizard.
 */
export async function runInteractiveWizard() {
  console.log(chalk.bold.green("\n🌱 Welcome to goGreen Interactive Wizard!\n"));

  const { mode } = await inquirer.prompt([
    {
      type: "list",
      name: "mode",
      message: "What kind of contribution design do you want to create?",
      choices: [
        { name: "🔤 Custom Text Art (Spell a word on your profile)", value: "text" },
        { name: "🎨 Preset Pixel Art (Heart, Space Invader, Pac-Man...)", value: "pattern" },
        { name: "📈 Realistic Dev Activity (Simulates organic daily commits)", value: "realistic" },
        { name: "🌐 Launch Interactive Web UI Designer (in browser)", value: "web" }
      ]
    }
  ]);

  if (mode === "web") {
    const { startWebServer } = await import("../web/server.js");
    return startWebServer({ openBrowser: true });
  }

  let grid;

  if (mode === "text") {
    const { text, intensity, autoCenter } = await inquirer.prompt([
      {
        type: "input",
        name: "text",
        message: "Enter the text to spell out (up to 8 characters recommended):",
        default: "GO",
        validate: input => input.trim().length > 0 ? true : "Please enter at least 1 character."
      },
      {
        type: "list",
        name: "intensity",
        message: "Contribution shade / intensity level:",
        choices: [
          { name: "Level 4 (Brightest vibrant green)", value: 4 },
          { name: "Level 3 (High bright green)", value: 3 },
          { name: "Level 2 (Medium green)", value: 2 },
          { name: "Level 1 (Subtle dark green)", value: 1 }
        ],
        default: 4
      },
      {
        type: "confirm",
        name: "autoCenter",
        message: "Auto-center text horizontally on the graph?",
        default: true
      }
    ]);

    grid = textToGrid(text.toUpperCase(), { intensity, autoCenter });
  } else if (mode === "pattern") {
    const patterns = listAvailablePatterns();
    const { patternName, intensity } = await inquirer.prompt([
      {
        type: "list",
        name: "patternName",
        message: "Select a pixel art pattern:",
        choices: patterns
      },
      {
        type: "list",
        name: "intensity",
        message: "Contribution intensity level:",
        choices: [
          { name: "Level 4 (Brightest vibrant green)", value: 4 },
          { name: "Level 3 (High bright green)", value: 3 },
          { name: "Level 2 (Medium green)", value: 2 },
          { name: "Level 1 (Subtle dark green)", value: 1 }
        ],
        default: 4
      }
    ]);

    grid = generatePatternGrid(patternName, { intensity });
  } else if (mode === "realistic") {
    const { targetDays } = await inquirer.prompt([
      {
        type: "number",
        name: "targetDays",
        message: "How many active contribution days do you want (50 - 300)?",
        default: 160,
        validate: num => num >= 1 && num <= 365 ? true : "Must be between 1 and 365"
      }
    ]);

    grid = generatePatternGrid("realistic", { targetDays });
  }

  // Ask for year / anchor
  const currentYear = new Date().getFullYear();
  const { yearChoice, dryRun, push } = await inquirer.prompt([
    {
      type: "list",
      name: "yearChoice",
      message: "Time window for commits:",
      choices: [
        { name: `Rolling past 52 weeks (up to today)`, value: "rolling" },
        { name: `Calendar year ${currentYear}`, value: currentYear },
        { name: `Calendar year ${currentYear - 1}`, value: currentYear - 1 }
      ]
    },
    {
      type: "confirm",
      name: "dryRun",
      message: "Run in DRY-RUN mode first? (Safe: does not touch Git)",
      default: true
    },
    {
      type: "confirm",
      name: "push",
      message: "Push commits to remote origin automatically?",
      default: false,
      when: answers => !answers.dryRun
    }
  ]);

  const calOptions = yearChoice === "rolling" ? {} : { year: yearChoice };
  const startDate = getCalendarStartDate(calOptions);
  const plan = gridToCommitPlan(grid, { startDate });

  console.log(chalk.bold("\n📅 Previewing Contribution Grid:\n"));
  console.log(renderGrid(grid, { startDate }));
  printPlanSummary(plan, { dryRun });

  const { confirmProceed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmProceed",
      message: dryRun ? "Run the dry-run simulation now?" : "Ready to write commits to your local repository?",
      default: true
    }
  ]);

  if (!confirmProceed) {
    console.log(chalk.yellow("Operation cancelled."));
    return;
  }

  console.log(chalk.cyan("\nExecuting..."));
  let lastPercent = -1;

  const result = await executeCommitPlan(plan, {
    dryRun,
    push: push || false,
    onProgress: status => {
      if (status.percent !== lastPercent && status.percent % 10 === 0) {
        console.log(`  Progress: ${status.percent}% (${status.current}/${status.total})`);
        lastPercent = status.percent;
      }
    }
  });

  if (result.dryRun) {
    console.log(chalk.bold.green(`\n✔ Dry-run simulated successfully! Planned ${result.totalCommits} commits across ${result.activeDays} days.`));
    console.log(chalk.dim("To execute for real, re-run without dry-run mode.\n"));
  } else {
    console.log(chalk.bold.green(`\n✔ Successfully committed ${result.totalCommits} commits to branch '${result.branch}'!`));
    if (result.pushed) {
      console.log(chalk.bold.green("✔ Pushed changes to origin!"));
    } else {
      console.log(chalk.dim("Tip: Changes are committed locally. Run `git push` when you are ready to update your GitHub profile."));
    }
  }
}
