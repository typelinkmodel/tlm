import { TlmFact, TlmLink, TlmObject } from "../../src";

test("TlmFact", async () => {
  const subject = new TlmObject(101, 200);
  const link = new TlmLink({
    oid: 102,
    fromType: 200,
    toType: 16,
    name: "aLink",
  });
  const value = "aValue";
  const o = new TlmFact(subject, link, value);
  expect(o.subject).toBe(subject);
  expect(o.link).toBe(link);
  expect(o.value).toBe(value);
});
