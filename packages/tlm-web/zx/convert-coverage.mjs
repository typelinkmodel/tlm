#!/usr/bin/env zx

/**
 * Convert V8 coverage from Playwright to Istanbul/lcov format.
 *
 * This script processes the raw V8 coverage files collected during Playwright tests
 * and converts them to Istanbul coverage format, which can then be converted to lcov
 * for consumption by SonarCloud and other tools.
 *
 * Based on the Playwright documentation example:
 * https://playwright.dev/docs/api/class-coverage
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import v8toIstanbul from "v8-to-istanbul";
import libCoverage from "istanbul-lib-coverage";
import libReport from "istanbul-lib-report";
import reports from "istanbul-reports";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.join(__dirname, "..");
const nycOutputDir = path.join(projectRoot, ".nyc_output");
const coverageDir = path.join(projectRoot, "coverage");

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

  // Merged Istanbul coverage map
  const coverageMap = {};
  let totalEntries = 0;
  let convertedEntries = 0;

  // Process each coverage file
  for (const file of files) {
    const filePath = path.join(nycOutputDir, file);
    echo(chalk.gray(`Processing ${file}...`));

    const coverageData = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    for (const entry of coverageData) {
      totalEntries++;

      try {
        // Use a virtual file path based on the URL
        // This works for inline scripts and bundled code
        const virtualPath = entry.url || `inline-${entry.scriptId}`;

        // Create converter with the source code
        const converter = v8toIstanbul(virtualPath, 0, {
          source: entry.source,
        });
        await converter.load();

        // Apply coverage data
        // The entry.functions array contains the coverage ranges
        converter.applyCoverage(entry.functions);

        // Convert to Istanbul format
        const istanbulCoverage = converter.toIstanbul();

        // Merge into coverage map
        Object.assign(coverageMap, istanbulCoverage);
        convertedEntries++;
      } catch (err) {
        // Skip entries that can't be converted (usually build artifacts)
        // Only log in verbose mode to avoid noise
        if (process.env.VERBOSE) {
          echo(chalk.gray(`  Skipped ${entry.url}: ${err.message}`));
        }
      }
    }
  }

  echo(
    chalk.green(
      `Converted ${convertedEntries} of ${totalEntries} coverage entries`,
    ),
  );

  // Ensure coverage directory exists
  if (!fs.existsSync(coverageDir)) {
    fs.mkdirSync(coverageDir, { recursive: true });
  }

  // Write merged Istanbul coverage
  const outputPath = path.join(coverageDir, "coverage-final.json");
  fs.writeFileSync(outputPath, JSON.stringify(coverageMap, null, 2));

  echo(chalk.blue(`\nCoverage data written to ${outputPath}`));
  echo(chalk.blue("\nGenerating lcov report..."));

  // Generate lcov report using Istanbul libraries
  try {
    // Create coverage map from our Istanbul coverage
    const map = libCoverage.createCoverageMap(coverageMap);

    // Create context for report generation
    const context = libReport.createContext({
      dir: coverageDir,
      coverageMap: map,
    });

    // Generate lcov report
    const lcovReport = reports.create("lcov", {});
    lcovReport.execute(context);

    // Generate text summary
    const textReport = reports.create("text-summary", {});
    textReport.execute(context);

    echo(chalk.green(`\nLcov report generated in ${coverageDir}/lcov.info`));
  } catch (err) {
    echo(chalk.red("Error generating lcov report:", err.message));
    echo(err.stack);
    process.exit(1);
  }
}

// Run the conversion
await convertCoverage();
