#!/usr/bin/env zx

import { sectionEnd, sectionStart, info, warn, notice } from "./common.mjs";
import fs from "fs/promises";
import path from "path";

/**
 * Simple semver comparison - returns negative if a < b, positive if a > b, 0 if equal
 */
function compareVersions(a, b) {
  const aParts = a
    .replace(/[^0-9.]/g, "")
    .split(".")
    .map(Number);
  const bParts = b
    .replace(/[^0-9.]/g, "")
    .split(".")
    .map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    if (aPart !== bPart) {
      return bPart - aPart; // Reverse for descending sort
    }
  }
  return 0;
}

/**
 * Parse the pnpm-lock.yaml to find duplicate dependencies
 */
async function findDuplicateDependencies() {
  const lockfilePath = path.join(process.cwd(), "pnpm-lock.yaml");
  const lockfileContent = await fs.readFile(lockfilePath, "utf-8");

  // Parse package versions from the lockfile
  // Format: packageName@version or @scope/packageName@version
  const packageVersions = new Map();

  // Match package entries in the packages section
  const lines = lockfileContent.split("\n");
  let inPackagesSection = false;

  for (const line of lines) {
    if (line.trim() === "packages:") {
      inPackagesSection = true;
      continue;
    }

    if (inPackagesSection && line.trim() === "snapshots:") {
      break;
    }

    if (inPackagesSection && line.match(/^\s{1,2}[^\s]/)) {
      // This is a package entry (indented by 1-2 spaces)
      const match = line.match(/^\s{1,2}(.+)@(\d+\.\d+\.\d+[^\s:]*)/);
      if (match) {
        const [, packageName, version] = match;

        if (!packageVersions.has(packageName)) {
          packageVersions.set(packageName, new Set());
        }
        packageVersions.get(packageName).add(version);
      }
    }
  }

  // Filter to only packages with multiple versions
  const duplicates = [];
  for (const [packageName, versions] of packageVersions) {
    if (versions.size > 1) {
      const sortedVersions = Array.from(versions).sort(compareVersions);
      duplicates.push({
        name: packageName,
        versions: sortedVersions,
        latest: sortedVersions[0],
      });
    }
  }

  // Sort by package name for consistent output
  duplicates.sort((a, b) => a.name.localeCompare(b.name));

  return duplicates;
}

/**
 * Read current package.json
 */
async function readPackageJson() {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const content = await fs.readFile(packageJsonPath, "utf-8");
  return JSON.parse(content);
}

/**
 * Write updated package.json
 */
async function writePackageJson(pkg) {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  await fs.writeFile(packageJsonPath, JSON.stringify(pkg, null, 2) + "\n");
}

/**
 * Add a pnpm override for a package
 */
async function addOverride(packageName, version) {
  const pkg = await readPackageJson();

  if (!pkg.pnpm) {
    pkg.pnpm = {};
  }

  if (!pkg.pnpm.overrides) {
    pkg.pnpm.overrides = {};
  }

  pkg.pnpm.overrides[packageName] = `^${version}`;

  await writePackageJson(pkg);
  info(`✓ Added override: ${packageName} = ^${version}`);
}

/**
 * Run pnpm install
 */
async function runInstall() {
  notice("Running pnpm install...");
  await $`pnpm install`;
}

/**
 * Run tests
 */
async function runTests() {
  notice("Running tests...");
  try {
    await $`pnpm run test`;
    return true;
  } catch (error) {
    warn("Tests failed!");
    return false;
  }
}

/**
 * Read cannot-override list from package.json
 */
async function getCannotOverrideList() {
  const pkg = await readPackageJson();
  return pkg["cannot-override"] || [];
}

/**
 * Main function
 */
async function main() {
  sectionStart("Deduplicate Dependencies");

  info("Analyzing pnpm-lock.yaml for duplicate dependencies...\n");

  const duplicates = await findDuplicateDependencies();
  const cannotOverride = await getCannotOverrideList();

  if (cannotOverride.length > 0) {
    info(
      `Found ${cannotOverride.length} package(s) in cannot-override list:\n`,
    );
    for (const pkg of cannotOverride) {
      notice(`  - ${pkg}`);
    }
    notice("");
  }

  if (duplicates.length === 0) {
    info("No duplicate dependencies found!");
    sectionEnd();
    return;
  }

  info(`Found ${duplicates.length} packages with multiple versions:\n`);

  for (const dup of duplicates) {
    notice(`${dup.name}:`);
    for (const version of dup.versions) {
      const marker = version === dup.latest ? " (latest)" : "";
      notice(`  - ${version}${marker}`);
    }
    notice("");
  }

  const pkg = await readPackageJson();
  const existingOverrides = pkg.pnpm?.overrides || {};

  let processed = 0;
  let skippedExisting = 0;
  let skippedCannotOverride = 0;
  const failedPackages = [];

  for (const dup of duplicates) {
    // Skip if in cannot-override list
    if (cannotOverride.includes(dup.name)) {
      notice(`Skipping ${dup.name} (in cannot-override list)`);
      skippedCannotOverride++;
      continue;
    }

    // Skip if already has an override
    if (existingOverrides[dup.name]) {
      notice(
        `Skipping ${dup.name} (already has override: ${existingOverrides[dup.name]})`,
      );
      skippedExisting++;
      continue;
    }

    notice(`\n${"=".repeat(60)}`);
    notice(`Package: ${chalk.bold(dup.name)}`);
    notice(`Versions found: ${dup.versions.join(", ")}`);
    notice(`Latest stable: ${chalk.green(dup.latest)}`);
    notice(`Adding override to pin to ^${dup.latest}...`);

    // Add the override
    await addOverride(dup.name, dup.latest);

    // Run pnpm install
    await runInstall();

    // Run tests
    const testsPassed = await runTests();

    if (testsPassed) {
      info(`✓ Tests passed for ${dup.name}`);
      processed++;
    } else {
      warn(`✗ Tests failed after adding override for ${dup.name}`);
      warn("Rolling back override...");

      // Remove the override
      const pkg = await readPackageJson();
      delete pkg.pnpm.overrides[dup.name];
      await writePackageJson(pkg);
      await runInstall();
      warn(`Rolled back override for ${dup.name}`);
      failedPackages.push({
        name: dup.name,
        versions: dup.versions,
        latest: dup.latest,
      });
    }
  }

  notice(`\n${"=".repeat(60)}`);
  info(`\nSummary:`);
  info(`  Successfully processed: ${processed}`);
  info(`  Skipped (cannot-override): ${skippedCannotOverride}`);
  info(`  Skipped (existing overrides): ${skippedExisting}`);
  info(`  Failed (rolled back): ${failedPackages.length}`);

  if (failedPackages.length > 0) {
    warn(`\nFailed package overrides (tests did not pass):`);
    for (const pkg of failedPackages) {
      warn(`  ${pkg.name}:`);
      warn(`    Versions found: ${pkg.versions.join(", ")}`);
      warn(`    Attempted version: ^${pkg.latest}`);
    }
  }

  const finalPkg = await readPackageJson();
  const finalOverrides = finalPkg.pnpm?.overrides || {};

  notice(`\nCurrent overrides in package.json:`);
  for (const [name, version] of Object.entries(finalOverrides)) {
    notice(`  ${name}: ${version}`);
  }

  sectionEnd();
}

main();
