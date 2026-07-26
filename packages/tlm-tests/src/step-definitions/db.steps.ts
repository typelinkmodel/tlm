/* eslint-disable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-unsafe-assignment */

import { type DataTable, Given } from "@cucumber/cucumber";
import type { ILoader } from "@typelinkmodel/tlm-core-db";

Given(/^this file is loaded:$/, async function (statements: DataTable) {
  // @ts-ignore
  const loader: ILoader = this.loader;
  for (const row of statements.raw()) {
    for (const cell of row) {
      await loader.loadFile(cell);
    }
  }
});
