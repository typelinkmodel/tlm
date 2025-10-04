import { TlmObject } from "@typelinkmodel/tlm-core-model";
import { Reader } from "../../src";

test("reader is a todo", async () => {
  const reader = new Reader();
  const subject = new TlmObject(1, 2);
  await expect(async () => {
    await reader.readFactUnique(subject, { links: ["foo"] });
  }).rejects.toThrow(/Not implemented/);
});
