import { Searcher } from "../../src";

test("searcher is a todo", async () => {
  const searcher = new Searcher();
  await expect(async () => {
    await searcher.getUnique({});
  }).rejects.toThrow(/Not implemented/);

  await expect(async () => {
    await searcher.findUnique({});
  }).rejects.toThrow(/Not implemented/);
});
