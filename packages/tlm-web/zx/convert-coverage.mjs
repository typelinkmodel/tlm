#!/usr/bin/env zx

/**
 * Convert V8 coverage from Playwright to lcov format using monocart-coverage-reports.
 *
 * This script processes the raw V8 coverage files collected during Playwright tests
 * and uses monocart-coverage-reports to automatically resolve source maps and generate
 * coverage reports based on the original source files.
 *
 * monocart-coverage-reports is specifically designed for this use case and handles:
 * - V8 coverage format from browsers
 * - Automatic source map resolution
 * - Multiple output formats (lcov, html, etc.)
 * - Proper mapping from bundled code back to original source files
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CoverageReport } from "monocart-coverage-reports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, "..");
const nycOutputDir = path.join(projectRoot, ".nyc_output");
const coverageDir = path.join(projectRoot, "coverage");
const srcDir = path.join(projectRoot, "src");

/**
 * Main conversion function
 */
async function convertCoverage() {
  // Check if .nyc_output directory exists
  if (!fs.existsSync(nycOutputDir)) {
    echo(chalk.yellow("No coverage data found in .nyc_output directory"));
    echo("Run Playwright tests first to collect coverage.");
    return;
  }

  // Read all coverage files
  const files = fs.readdirSync(nycOutputDir).filter((f) => f.endsWith(".json"));

  if (files.length === 0) {
    echo(chalk.yellow("No coverage files found in .nyc_output directory"));
    return;
  }

  echo(chalk.blue(`Found ${files.length} coverage file(s)`));

  // Collect all coverage data
  const allCoverage = [];
  for (const file of files) {
    const filePath = path.join(nycOutputDir, file);
    echo(chalk.gray(`Reading ${file}...`));
    const coverageData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    allCoverage.push(...coverageData);
  }

  echo(chalk.blue(`Total coverage entries: ${allCoverage.length}`));

  // Create monocart coverage report
  const coverageReport = new CoverageReport({
    name: "TLM Web E2E Coverage",

    // Output directory
    outputDir: coverageDir,

    // Reports to generate
    reports: [
      "v8",
      "console-summary",
      ["lcov", { projectRoot: projectRoot }],
      ["html", { subdir: "html" }],
      ["json", { file: "coverage-final.json" }],
    ],

    // Entry filter - only include application code from localhost
    entryFilter: (entry) => {
      const url = entry.url || "";

      // Include only localhost URLs
      if (!url.startsWith("http://localhost:3000")) {
        return false;
      }

      // Exclude Next.js internals and development artifacts
      if (
        url.includes("/_next/static/chunks/[turbopack]") ||
        url.includes("/hmr-client") ||
        url.includes("/polyfills") ||
        url.includes("/webpack")
      ) {
        return false;
      }

      return true;
    },

    // Source filter - only include our source files in the report
    sourceFilter: (sourcePath) => {
      // Normalize the path
      const normalizedPath = sourcePath.replace(/\\/g, "/");

      // Include files from src directory (original source files)
      if (normalizedPath.includes("/src/app/")) {
        return true;
      }

      // Also include if it matches our project structure
      if (normalizedPath.includes("/packages/tlm-web/src/")) {
        return true;
      }

      // Exclude everything else (node_modules, Next.js internals, etc.)
      return false;
    },

    // Enable source map resolution
    sourceMap: {
      // Use inline source maps from the bundled code
      inline: true,
      // Try to resolve sources from source maps
      sources: true,
      // Source map cache to avoid re-fetching
      cache: true,
      // Custom source map loader to read from .next/static directory
      loader: async (filePath, info) => {
        // filePath is the URL to the source map (e.g., http://localhost:3000/_next/static/chunks/file.js.map)
        if (filePath.startsWith("http://localhost:3000/_next/")) {
          // Map URL to local .next directory
          const urlPath = filePath.replace("http://localhost:3000/", "");
          const localPath = path.join(
            projectRoot,
            ".next",
            urlPath.replace("/_next/", ""),
          );

          if (fs.existsSync(localPath)) {
            return fs.readFileSync(localPath, "utf-8");
          }
        }
        // Return null to let monocart try default loading
        return null;
      },
    },

    // Clean previous coverage data
    clean: true,

    // Logging level
    logging: "info",

    // Inline source configuration
    inline: {
      // Don't inline the source in the HTML report (keeps it smaller)
      source: false,
    },
  });

  try {
    // Add all coverage data
    echo(
      chalk.blue("\nProcessing coverage data with source map resolution..."),
    );
    await coverageReport.add(allCoverage);

    // Generate reports
    echo(chalk.blue("\nGenerating coverage reports..."));
    const reportResults = await coverageReport.generate();

    // Display summary
    echo(chalk.green("\n✓ Coverage reports generated successfully!"));
    echo(chalk.blue(`\nOutput directory: ${coverageDir}`));
    echo(chalk.blue(`  - lcov.info: Code coverage in lcov format`));
    echo(chalk.blue(`  - html/: HTML coverage report`));
    echo(chalk.blue(`  - coverage-final.json: JSON coverage data`));

    // Display summary from results
    if (reportResults && reportResults.summary) {
      const { summary } = reportResults;
      echo(chalk.blue("\nCoverage Summary:"));
      echo(
        chalk.cyan(
          `  Lines: ${summary.lines.pct}% (${summary.lines.covered}/${summary.lines.total})`,
        ),
      );
      echo(
        chalk.cyan(
          `  Branches: ${summary.branches.pct}% (${summary.branches.covered}/${summary.branches.total})`,
        ),
      );
      echo(
        chalk.cyan(
          `  Functions: ${summary.functions.pct}% (${summary.functions.covered}/${summary.functions.total})`,
        ),
      );
      echo(
        chalk.cyan(
          `  Statements: ${summary.statements.pct}% (${summary.statements.covered}/${summary.statements.total})`,
        ),
      );
    }

    // Provide guidance if coverage seems low or empty
    if (reportResults && reportResults.summary) {
      const { summary } = reportResults;
      if (summary.lines.total === 0) {
        echo(chalk.yellow("\n⚠ No source files were found in coverage."));
        echo(
          chalk.yellow(
            "This might mean source maps aren't being resolved correctly.",
          ),
        );
        echo(
          chalk.yellow(
            "Check that Next.js is running in development mode with source maps enabled.",
          ),
        );
      }
    }
  } catch (err) {
    echo(chalk.red("Error generating coverage reports:"));
    echo(chalk.red(err.message));
    if (err.stack) {
      echo(chalk.gray(err.stack));
    }
    process.exit(1);
  }
}

// Run the conversion
await convertCoverage();
