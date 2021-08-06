import { TlmFact, TlmObject, TlmLink } from "../../src";

test("TlmFact", async () => {
  let subject = new TlmObject(101, 200);
  let link = new TlmLink(102, 200, 16, "aLink");
  let value = "aValue";
  const o = new TlmFact(subject, link, value);
  expect(o.subject).toBe(subject);
  expect(o.link).toBe(link);
  expect(o.value).toBe(value);
});
