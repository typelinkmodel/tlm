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

test("addStatement: basic usage with 'has exactly one'", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";

    modeler.addStatement("A Person has exactly one name which must be a string.");
    modeler.addStatement("A Person has exactly one coach which must be a Person.");
    modeler.addStatement("A Department has exactly one manager which must be a Person.");

    expect(modeler.namespaces.hr.uri).toBe("https://type.link.model.tools/ns/tlm-sample-hr/");
    expect(modeler.types.hr.Person).toBeDefined();
    expect(modeler.types.hr.Person.name).toBe("Person");
    expect(modeler.types.hr.Person.namespace).toBe(modeler.namespaces.hr.oid);
    expect(modeler.types.hr.Person.type).toBe(modeler.types.tlm.Type.oid);
    expect(modeler.types.hr.Person.superType).toBe(modeler.types.tlm.Type.oid);

    expect(modeler.links.hr.Person.name.fromType).toBe(modeler.types.hr.Person.oid);
    expect(modeler.links.hr.Person.name.name).toBe("name");
    expect(modeler.links.hr.Person.name.toType).toBe(modeler.types.xs.string.oid);

    expect(modeler.links.hr.Person.coach.fromType).toBe(modeler.types.hr.Person.oid);
    expect(modeler.links.hr.Person.coach.name).toBe("coach");
    expect(modeler.links.hr.Person.coach.toType).toBe(modeler.types.hr.Person.oid);

    expect(modeler.links.hr.Department.manager.fromType).toBe(modeler.types.hr.Department.oid);
    expect(modeler.links.hr.Department.manager.name).toBe("manager");
    expect(modeler.links.hr.Department.manager.toType).toBe(modeler.types.hr.Person.oid);
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

test("addStatement: 'A' and 'An' are both ok", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";
    modeler.addStatement("An Individual has exactly one name which must be an integer.");
});

test("addStatement: identifier definitions", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";

    modeler.addStatement("A Person is identified by id which must be a URI.");
    const link = modeler.links.hr.Person.id;
    expect(link).toBeDefined();
    expect(link.isPrimaryId).toBe(true);
});

test("addStatement: has at most one", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";

    modeler.addStatement("A Team has at most one name which must be a string.");
    const link = modeler.links.hr.Team.name;
    expect(link).toBeDefined();
    expect(link.isMandatory).toBe(false);
    expect(link.isSingular).toBe(true);
    expect(link.isPrimaryId).toBe(false);
});

test("addStatement: has at least one", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";

    modeler.addStatement("A Team has at least one lead which must be a Person.");
    const link = modeler.links.hr.Team.lead;
    expect(link).toBeDefined();
    expect(link.isMandatory).toBe(true);
    expect(link.isSingular).toBe(false);
    expect(link.isPrimaryId).toBe(false);
});

test("addStatement: can have some", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";

    modeler.addStatement("A Person can have some team each of which must be a Team.");
    const link = modeler.links.hr.Person.team;
    expect(link).toBeDefined();
    expect(link.isMandatory).toBe(false);
    expect(link.isSingular).toBe(false);
    expect(link.isPrimaryId).toBe(false);
});

test("addStatement: support extra whitespace", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    modeler.addNamespace("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
    modeler.activeNamespace = "hr";

    modeler.addStatement(`
    A  Person  has
        exactly   one
            name
        which  must  be  a
            string
     .`);

    expect(modeler.types.hr.Person).toBeDefined();
    expect(modeler.links.hr.Person.name.fromType).toBe(modeler.types.hr.Person.oid);
    expect(modeler.links.hr.Person.name.toType).toBe(modeler.types.xs.string.oid);
});

test("getValueTypeForLink: basic usage", async () => {
    const modeler: Modeler = new Modeler();
    modeler.initialize();
    expect(modeler.getValueTypeForLink(modeler.links.tlm.Type.namespace).name).toBe("Namespace");
});

test("processLinkDefinitionStatement: cover unreachable default case", async () => {
    const modeler: Modeler = new Modeler();
    expect(() => {
        (modeler as any).processLinkDefinitionStatement([
            "A Person flub-boxes things which must be a Team.",
            "Person",
            "flub-boxes",
            "things",
            "Team",
        ]);
    }).toThrowError(/Cannot process statement relationship/);
});

test("constructor: inject dependencies", async () => {
    const oidGenerator = new OidGenerator();
    const namespaceModel = new NamespaceModel(oidGenerator);
    const typeModel = new TypeModel(oidGenerator, namespaceModel);
    const linkModel = new LinkModel(oidGenerator, namespaceModel, typeModel);
    expect(new Modeler(oidGenerator, namespaceModel, typeModel, linkModel)).toBeDefined();
});
