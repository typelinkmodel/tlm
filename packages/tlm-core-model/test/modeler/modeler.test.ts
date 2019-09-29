import {IModeler, Modeler, TlmNamespace} from "../../src";
import {LinkModel} from "../../src/modeler/link";
import {NamespaceModel} from "../../src/modeler/namespace";
import {OidGenerator} from "../../src/modeler/oid";
import {TypeModel} from "../../src/modeler/type";

test("initialize(): Modeler lazy loading means initially the model is empty", async () => {
    const modeler: IModeler = new Modeler();
    expect(modeler.types.tlm).toBeUndefined();
    expect(modeler.namespaces.tlm).toBeUndefined();
    expect(modeler.links.tlm).toBeUndefined();
});

test("initialize(): Modeler initialization loads the core model", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    expect(modeler.types.tlm.Namespace.name).toBe("Namespace");
    expect(modeler.types.tlm.Type.namespace).toBe(modeler.namespaces.tlm.oid);
    expect(modeler.links.tlm.Link["is singular"].fromType).toBe(modeler.types.tlm.Link.oid);
});

test("initialize(): can safely be called more than once", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.initialize();
    modeler.initialize();
});

test("activeNamespace: basic usage", async () => {
    const modeler: Modeler = new Modeler();
    modeler.addNamespace("foo", "https://example.com/ns/foo");
    modeler.activeNamespace = "foo";
    expect(modeler.activeNamespace).toBe("foo");
});

test("activeNamespace: Initially no namespace is active", async () => {
    const modeler: Modeler = new Modeler();
    expect(() => modeler.activeNamespace).toThrowError(/not set/);
});

test("activeNamespace: Can't activate an unknown namespace", async () => {
    const modeler: Modeler = new Modeler();
    expect(() => modeler.activeNamespace = "foo").toThrowError(/foo/);
});

test("activeNamespace: Can't deactivate namespace", async () => {
    const modeler: Modeler = new Modeler();
    modeler.addNamespace("foo", "https://example.com/ns/foo");
    modeler.activeNamespace = "foo";
    const untypedModeler = modeler as any;
    expect(() => untypedModeler.activeNamespace = undefined).toThrowError(/deactivate/);
    expect(() => untypedModeler.activeNamespace = null).toThrowError(/deactivate/);
});

test("activeNamespace: Can't activate built-in namespaces", async () => {
    const modeler: Modeler = new Modeler();
    expect(() => modeler.activeNamespace = "tlm").toThrowError(/You should not modify/);
    expect(() => modeler.activeNamespace = "xs").toThrowError(/You should not modify/);
});

test("addNamespace: basic usage", async () => {
    const modeler: Modeler = new Modeler();
    modeler.addNamespace("foo", "https://example.com/ns/foo");
    modeler.addNamespace("bar", "https://example.com/ns/bar", "It may be about drinking.");

    expect(modeler.namespaces.foo.uri).toBe("https://example.com/ns/foo");
    expect(modeler.namespaces.bar.uri).toBe("https://example.com/ns/bar");
    expect(modeler.namespaces.bar.description).toMatch(/drinking/);
});

test("addNamespace: cannot modify previously defined namespace", async () => {
    const modeler: Modeler = new Modeler();

    const fooNs = modeler.addNamespace("foo", "https://example.com/ns/foo");
    expect(fooNs.oid).toBeGreaterThan(0);
    expect(fooNs.type).toBe(TlmNamespace.NAMESPACE_TYPE);
    expect(fooNs.prefix).toBe("foo");
    expect(fooNs.uri).toBe("https://example.com/ns/foo");
    expect(fooNs.description).toBeUndefined();

    // can't modify namespace after adding
    expect( () => modeler.addNamespace("foo", "https://example.com/ns/bar")).toThrowError(/already exists/);
    expect( () => modeler.addNamespace("bar", "https://example.com/ns/foo")).toThrowError(/already exists/);

    // but if the values are the same, ignore the api call
    expect(modeler.addNamespace("foo", "https://example.com/ns/foo").prefix).toBe("foo");

    // edge case: can't change the description either
    modeler.addNamespace("foo", "https://example.com/ns/foo", "new description");
    expect(modeler.namespaces.foo.description).toBeUndefined();
});

test("addStatement: basic usage", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";

    modeler.addStatement("A Person has exactly one name which must be a string.");
    modeler.addStatement("A Person has exactly one coach which must be a Person.");
    modeler.addStatement("A Department has exactly one manager which must be a Person.");
});

test("addStatement: can only process certain statements", async () => {
    const modeler: Modeler = new Modeler();
    expect(
        () => modeler.addStatement(
            "Thousands of monkeys might write something nice but I don't know how to read it"),
    ).toThrowError(/statement/);
});

test("addStatement: types are namespaced", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";
    modeler.addStatement("A Person has exactly one name which must be a string.");

    modeler.addNamespace("foo", "https://example.com/ns/foo");
    modeler.activeNamespace = "foo";
    modeler.addStatement("A Person has exactly one name which must be a string.");

    expect(modeler.types.hr.Person.oid).toBeDefined();
    expect(modeler.types.foo.Person.oid).toBeDefined();
    expect(modeler.types.hr.Person.oid).not.toBe(modeler.types.foo.Person.oid);
});

test("addStatement: statements can be repeated", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";
    modeler.addStatement("A Person has exactly one name which must be a string.");
    modeler.addStatement("A Person has exactly one name which must be a string.");
});

test("addStatement: active namespace is needed", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    expect(
        () => modeler.addStatement("A Person has exactly one name which must be a string."),
    ).toThrowError(/Active namespace/i);
});

test("getValueTypeForLink: basic usage", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    expect(modeler.getValueTypeForLink(modeler.links.tlm.Type.namespace).name).toBe("Namespace");
});

test("constructor: inject dependencies", async () => {
    const oidGenerator = new OidGenerator();
    const namespaceModel = new NamespaceModel(oidGenerator);
    const typeModel = new TypeModel(oidGenerator, namespaceModel);
    const linkModel = new LinkModel(oidGenerator, namespaceModel, typeModel);
    expect(new Modeler(oidGenerator, namespaceModel, typeModel, linkModel)).toBeDefined();
});
