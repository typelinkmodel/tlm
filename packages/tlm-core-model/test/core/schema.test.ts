import { TlmLink, TlmNamespace, TlmObject, TlmType } from "../../src";

test("TlmObject", () => {
  const o = new TlmObject(98, TlmType.TYPE_TYPE);
  expect(o.oid).toBe(98);
  expect(o.type).toBe(4);
});

test("TlmNamespace", () => {
  const ns = new TlmNamespace(
    99,
    "sample",
    "https://example.com/ns",
    "Test namespace"
  );
  expect(ns.oid).toBe(99);
  expect(ns.type).toBe(TlmNamespace.NAMESPACE_TYPE);
  expect(ns.prefix).toBe("sample");
  expect(ns.uri).toBe("https://example.com/ns");
  expect(ns.description).toBe("Test namespace");
});

test("TlmType", () => {
  const t = new TlmType(
    100,
    99,
    "SampleType",
    TlmType.TYPE_TYPE,
    "Test type",
    "SampleTypes"
  );
  expect(t.oid).toBe(100);
  expect(t.type).toBe(TlmType.TYPE_TYPE);
  expect(t.namespace).toBe(99);
  expect(t.name).toBe("SampleType");
  expect(t.superType).toBe(TlmType.TYPE_TYPE);
  expect(t.description).toBe("Test type");
  expect(t.plural).toBe("SampleTypes");
});

const nameLink: any = {
  oid: 101,
  fromType: 100,
  toType: 16, // string
  name: "name",
};

test("TlmLink: basic usage", () => {
  let l = new TlmLink(nameLink);
  expect(l.oid).toBe(nameLink.oid);
  expect(l.type).toBe(TlmLink.LINK_TYPE);
  expect(l.fromType).toBe(nameLink.fromType);
  expect(l.toType).toBe(nameLink.toType);
  expect(l.name).toBe("name");

  l = new TlmLink({ ...nameLink, fromName: "parent", toName: "child" });
  expect(l.oid).toBe(nameLink.oid);
  expect(l.type).toBe(TlmLink.LINK_TYPE);
  expect(l.fromType).toBe(nameLink.fromType);
  expect(l.toType).toBe(nameLink.toType);
  expect(l.fromName).toBe("parent");
  expect(l.toName).toBe("child");
});

function testBooleanLinkProperty(prop: keyof TlmLink, defaultValue = false) {
  let o = { ...nameLink };
  let l = new TlmLink(o);
  expect(l[prop]).toBe(defaultValue);

  o[prop] = defaultValue;
  l = new TlmLink(o);
  expect(l[prop]).toBe(defaultValue);

  o[prop] = !defaultValue;
  l = new TlmLink(o);
  expect(l[prop]).toBe(!defaultValue);
}

test("TlmLink: that is singular", () => {
  testBooleanLinkProperty("isSingular", false);
});

test("TlmLink: that is mandatory", () => {
  testBooleanLinkProperty("isMandatory", false);
});

test("TlmLink: that is a primary id", () => {
  testBooleanLinkProperty("isPrimaryId", false);

  expect(() => {
    return new TlmLink({ ...nameLink, isPrimaryId: true, isSingular: false });
  }).toThrowError(/Primary ID links must be singular/);

  expect(() => {
    return new TlmLink({ ...nameLink, isPrimaryId: true, isMandatory: false });
  }).toThrowError(/Primary ID links must be mandatory/);

  expect(() => {
    return new TlmLink({ ...nameLink, isPrimaryId: true, isValue: false });
  }).toThrowError(/Primary ID links must be to a value/);
});

test("TlmLink: that is singular to the target", () => {
  testBooleanLinkProperty("isSingularTo", false);
});

test("TlmLink: that is mandatory to the target", () => {
  testBooleanLinkProperty("isMandatoryTo", false);
});

test("TlmLink: that is a toggle", () => {
  testBooleanLinkProperty("isToggle", false);

  expect(() => {
    return new TlmLink({ ...nameLink, isToggle: true, isSingular: false });
  }).toThrowError(/Toggle links must be singular/);

  expect(() => {
    return new TlmLink({ ...nameLink, isToggle: true, isMandatory: false });
  }).toThrowError(/Toggle links must be mandatory/);

  expect(() => {
    return new TlmLink({ ...nameLink, isToggle: true, isValue: false });
  }).toThrowError(/Toggle links must be to a value/);
});

test("TlmLink: that is a value", () => {
  testBooleanLinkProperty("isValue", false);
});

test("TlmLink: that has a description", () => {
  let l = new TlmLink(nameLink);
  expect(l.description).toBeUndefined();

  l = new TlmLink({ ...nameLink, description: "aDescription" });
  expect(l.description).toBe("aDescription");
});
