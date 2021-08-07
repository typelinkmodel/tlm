import { TlmFact, TlmObject, TlmLink } from "../../src";

test("TlmFact", async () => {
  let subject = new TlmObject(101, 200);
  let link = new TlmLink({
    oid: 102,
    fromType: 200,
    toType: 16,
    name: "aLink",
  });
  let value = "aValue";
  const o = new TlmFact(subject, link, value);
  expect(o.subject).toBe(subject);
  expect(o.link).toBe(link);
  expect(o.value).toBe(value);
});
