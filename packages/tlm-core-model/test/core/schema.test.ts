import {TlmNamespace, TlmObject, TlmType} from "../../src";

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
