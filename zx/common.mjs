#!/usr/bin/env zx

import settings from "./settings.mjs";

export function warn(...args) {
  echo(chalk.red(...args));
}

export function info(...args) {
  echo(chalk.green(...args));
}

export function notice(...args) {
  echo(...args);
}

export function sectionStart(...args) {
  echo(chalk.blueBright(settings.SectionStartPrefix + args.join(" ")));
}

export function sectionEnd() {
  echo(chalk.blueBright(settings.SectionEndMessage));
}

export async function testDockerIsRunning(containerName) {
  try {
    let container = (await $`docker ps -q -f name=${containerName}`).stdout.trim();
    return container !== "";
  } catch (err) {
    return false;
  }
}
