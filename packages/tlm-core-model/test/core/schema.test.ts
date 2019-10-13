import {TlmLink, TlmNamespace, TlmObject, TlmType} from "../../src";

test("TlmObject", async () => {
    const o = new TlmObject(98, TlmType.TYPE_TYPE);
    expect(o.oid).toBe(98);
    expect(o.type).toBe(4);
});

test("TlmNamespace", async () => {
    const ns = new TlmNamespace(
        99,
        "sample",
        "https://example.com/ns",
        "Test namespace");
    expect(ns.oid).toBe(99);
    expect(ns.type).toBe(TlmNamespace.NAMESPACE_TYPE);
    expect(ns.prefix).toBe("sample");
    expect(ns.uri).toBe("https://example.com/ns");
    expect(ns.description).toBe("Test namespace");
});

test("TlmType", async () => {
    const t = new TlmType(
        100,
        99,
        "SampleType",
        TlmType.TYPE_TYPE,
        "Test type");
    expect(t.oid).toBe(100);
    expect(t.type).toBe(TlmType.TYPE_TYPE);
    expect(t.namespace).toBe(99);
    expect(t.name).toBe("SampleType");
    expect(t.superType).toBe(TlmType.TYPE_TYPE);
    expect(t.description).toBe("Test type");
});

test("TlmLink: basic usage", async () => {
    let l = new TlmLink(
        101,
        100,
        16, // string
        "name");
    expect(l.oid).toBe(101);
    expect(l.type).toBe(TlmLink.LINK_TYPE);
    expect(l.fromType).toBe(100);
    expect(l.toType).toBe(16);
    expect(l.name).toBe("name");

    l = new TlmLink(
        102,
        100,
        100, // string
        "sample parent/child link",
        "parent",
        "child");
    expect(l.oid).toBe(102);
    expect(l.type).toBe(TlmLink.LINK_TYPE);
    expect(l.fromType).toBe(100);
    expect(l.toType).toBe(100);
    expect(l.name).toBe("sample parent/child link");
    expect(l.fromName).toBe("parent");
    expect(l.toName).toBe("child");
});

test("TlmLink: that is singular", async () => {
    let l = new TlmLink(
        101,
        100,
        16, // string
        "name");
    expect(l.isSingular).toBe(false);

    l = new TlmLink(
        101,
        100,
        16, // string
        "name",
        undefined,
        undefined,
        false);
    expect(l.isSingular).toBe(false);

    l = new TlmLink(
        101,
        100,
        16, // string
        "name",
        undefined,
        undefined,
        true);
    expect(l.isSingular).toBe(true);
});

test("TlmLink: that is mandatory", async () => {
    let l = new TlmLink(
        101,
        100,
        16, // string
        "name");
    expect(l.isMandatory).toBe(false);

    l = new TlmLink(
        101,
        100,
        16, // string
        "name",
        undefined,
        undefined,
        false,
        false);
    expect(l.isMandatory).toBe(false);

    l = new TlmLink(
        101,
        100,
        16, // string
        "name",
        undefined,
        undefined,
        false,
        true);
    expect(l.isMandatory).toBe(true);
});

test("TlmLink: that is a primary id", async () => {
    let l = new TlmLink(
        101,
        100,
        16, // string
        "name");
    expect(l.isPrimaryId).toBe(false);

    l = new TlmLink(
        101,
        100,
        16, // string
        "name",
        undefined,
        undefined,
        false,
        false,
        false);
    expect(l.isPrimaryId).toBe(false);

    l = new TlmLink(
        101,
        100,
        16, // string
        "name",
        undefined,
        undefined,
        true,
        true,
        true);
    expect(l.isPrimaryId).toBe(true);

    expect(() => {
        return new TlmLink(
            101,
            100,
            16, // string
            "name",
            undefined,
            undefined,
            false,
            true,
            true);
    }).toThrowError(/must be singular/);

    expect(() => {
        return new TlmLink(
            101,
            100,
            16, // string
            "name",
            undefined,
            undefined,
            true,
            false,
            true);
    }).toThrowError(/must be mandatory/);
});
