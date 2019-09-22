import {TlmNamespace, TlmObject, TlmType} from "../../src";

test("TlmObject", async () => {
    const o = new TlmObject(2, 1);
    expect(o.oid).toBe(2);
    expect(o.type).toBe(1);
});

test("TlmNamespace", async () => {
    const ns = new TlmNamespace(
        2,
        "sample",
        "https://example.com/ns",
        "Test namespace");
    expect(ns.oid).toBe(2);
    expect(ns.prefix).toBe("sample");
    expect(ns.uri).toBe("https://example.com/ns");
    expect(ns.description).toBe("Test namespace");
});

test("TlmType", async () => {
    const t = new TlmType(
        3,
        2,
        "SampleType",
        3,
        "Test type");
    expect(t.oid).toBe(3);
    expect(t.namespace).toBe(2);
    expect(t.name).toBe("SampleType");
    expect(t.superType).toBe(3);
    expect(t.description).toBe("Test type");
});
