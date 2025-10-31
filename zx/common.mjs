#!/usr/bin/env zx

import settings from "./settings.mjs";
import { Socket } from "net";
import { setTimeout } from "timers/promises";

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

export async function quiet(func) {
  const verbose = $.verbose;
  $.verbose = false;
  await func();
  $.verbose = verbose;
}

export async function testDockerIsRunning(containerName) {
  try {
    let container = (
      await $`docker ps -q -f name=${containerName}`
    ).stdout.trim();
    return container !== "";
  } catch (err) {
    return false;
  }
}

export async function waitFor(poll, wait = 5000) {
  const period = 100;
  const steps = wait / period;
  for (let i = 0; i < steps; i++) {
    try {
      process.stdout.write(".");
      await poll();
      process.stdout.write("\n");
      return;
    } catch (err) {
      await setTimeout(period);
    }
  }
  process.stdout.write("X\n");
}

export async function waitForSocket(host, port, wait = 5000) {
  process.stdout.write(`wait for connection to ${host}:${port}`);
  await waitFor(
    () =>
      new Promise((resolve, reject) => {
        const socket = new Socket();
        socket.setTimeout(10);
        socket.once("connect", () => {
          socket.end();
          resolve();
        });
        socket.once("error", () => {
          socket.destroy();
          reject("connection error");
        });
        socket.once(
          "timeout",
          () => {
            socket.destroy();
            reject("timeout");
          },
          wait,
        );
        socket.connect(port, host);
      }),
  );
}
