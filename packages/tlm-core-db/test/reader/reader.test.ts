import { Reader } from "../../src";

test("reader is a todo", async () => {
  const reader = new Reader();
  await expect(async () => {
    await reader.readFactUnique();
  }).rejects.toThrow(/Not implemented/);
});
