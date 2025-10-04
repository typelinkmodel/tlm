import { IModeler, Modeler, TlmNamespace } from "../../src";
import { LinkModel } from "../../src/modeler/link";
import { NamespaceModel } from "../../src/modeler/namespace";
import { OidGenerator } from "../../src/modeler/oid";
import { TypeModel } from "../../src/modeler/type";

test("initialize(): Modeler lazy loading means initially the model is empty", async () => {
  const modeler: IModeler = new Modeler();
  expect(modeler.types.tlm).toBeUndefined();
  expect(modeler.namespaces.tlm).toBeUndefined();
  expect(modeler.links.tlm).toBeUndefined();
});

test("initialize(): Modeler initialization loads the core model", async () => {
  const modeler: Modeler = new Modeler();
  await modeler.initialize();
  expect(modeler.types.tlm.Namespace.name).toBe("Namespace");
  expect(modeler.types.tlm.Type.namespace).toBe(modeler.namespaces.tlm.oid);
  expect(modeler.links.tlm.Link["is singular"].fromType).toBe(
    modeler.types.tlm.Link.oid,
  );
});

test("initialize(): can safely be called more than once", async () => {
  const modeler: Modeler = new Modeler();
  await modeler.initialize();
  await modeler.initialize();
  await modeler.initialize();
});

test("activeNamespace: basic usage", async () => {
  const modeler: Modeler = new Modeler();
  await modeler.addNamespace("foo", "https://example.com/ns/foo");
  modeler.activeNamespace = "foo";
  expect(modeler.activeNamespace).toBe("foo");
});

test("activeNamespace: Initially no namespace is active", async () => {
  const modeler: Modeler = new Modeler();
  expect(modeler.activeNamespace).toBeUndefined();
});

test("activeNamespace: Can't activate an unknown namespace", async () => {
  const modeler: Modeler = new Modeler();
  expect(() => (modeler.activeNamespace = "foo")).toThrow(/foo/);
});

test("activeNamespace: Namespace deactivation ignored", async () => {
  const modeler: Modeler = new Modeler();
  await modeler.addNamespace("foo", "https://example.com/ns/foo");
  modeler.activeNamespace = "foo";
  const untypedModeler = modeler as any;
  untypedModeler.activeNamespace = undefined;
  expect(modeler.activeNamespace).toBeDefined();
  untypedModeler.activeNamespace = null;
  expect(modeler.activeNamespace).toBeDefined();
});

test("activeNamespace: Can't activate built-in namespaces", async () => {
  const modeler: Modeler = new Modeler();
  expect(() => (modeler.activeNamespace = "tlm")).toThrow(
    /You should not modify/,
  );
  expect(() => (modeler.activeNamespace = "xs")).toThrow(
    /You should not modify/,
  );
});

test("addNamespace: basic usage", async () => {
  const modeler: Modeler = new Modeler();
  await modeler.addNamespace("foo", "https://example.com/ns/foo");
  await modeler.addNamespace(
    "bar",
    "https://example.com/ns/bar",
    "It may be about drinking.",
  );

  expect(modeler.namespaces.foo.uri).toBe("https://example.com/ns/foo");
  expect(modeler.namespaces.bar.uri).toBe("https://example.com/ns/bar");
  expect(modeler.namespaces.bar.description).toMatch(/drinking/);
});

test("addNamespace: cannot modify previously defined namespace", async () => {
  const modeler: Modeler = new Modeler();

  const fooNs = await modeler.addNamespace("foo", "https://example.com/ns/foo");
  expect(fooNs.oid).toBeGreaterThan(0);
  expect(fooNs.type).toBe(TlmNamespace.NAMESPACE_TYPE);
  expect(fooNs.prefix).toBe("foo");
  expect(fooNs.uri).toBe("https://example.com/ns/foo");
  expect(fooNs.description).toBeUndefined();

  // can't modify namespace after adding
  await expect(async () => {
    await modeler.addNamespace("foo", "https://example.com/ns/bar");
  }).rejects.toThrow(/already exists/);
  await expect(async () => {
    await modeler.addNamespace("bar", "https://example.com/ns/foo");
  }).rejects.toThrow(/already exists/);

  // but if the values are the same, ignore the api call
  const resultNs = await modeler.addNamespace(
    "foo",
    "https://example.com/ns/foo",
  );
  expect(resultNs.prefix).toBe("foo");

  // edge case: can't change the description either
  await modeler.addNamespace(
    "foo",
    "https://example.com/ns/foo",
    "new description",
  );
  expect(modeler.namespaces.foo.description).toBeUndefined();
});

test("addStatement: basic usage with 'has exactly one'", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement(
    "A Person has exactly one name which must be a string.",
  );
  await modeler.addStatement(
    "A Person has exactly one coach which must be a Person.",
  );
  await modeler.addStatement(
    "A Department has exactly one manager which must be a Person.",
  );

  expect(modeler.namespaces.hr.uri).toBe(
    "https://type.link.model.tools/ns/tlm-sample-hr/",
  );
  expect(modeler.types.hr.Person).toBeDefined();
  expect(modeler.types.hr.Person.name).toBe("Person");
  expect(modeler.types.hr.Person.namespace).toBe(modeler.namespaces.hr.oid);
  expect(modeler.types.hr.Person.type).toBe(modeler.types.tlm.Type.oid);
  expect(modeler.types.hr.Person.superType).toBe(modeler.types.tlm.Type.oid);

  expect(modeler.links.hr.Person.name.fromType).toBe(
    modeler.types.hr.Person.oid,
  );
  expect(modeler.links.hr.Person.name.name).toBe("name");
  expect(modeler.links.hr.Person.name.toType).toBe(modeler.types.xs.string.oid);

  expect(modeler.links.hr.Person.coach.fromType).toBe(
    modeler.types.hr.Person.oid,
  );
  expect(modeler.links.hr.Person.coach.name).toBe("coach");
  expect(modeler.links.hr.Person.coach.toType).toBe(
    modeler.types.hr.Person.oid,
  );

  expect(modeler.links.hr.Department.manager.fromType).toBe(
    modeler.types.hr.Department.oid,
  );
  expect(modeler.links.hr.Department.manager.name).toBe("manager");
  expect(modeler.links.hr.Department.manager.toType).toBe(
    modeler.types.hr.Person.oid,
  );
});

test("addStatement: can only process certain statements", async () => {
  const modeler: Modeler = new Modeler();
  await expect(async () => {
    await modeler.addStatement(
      "Thousands of monkeys might write something nice but I don't know how to read it",
    );
  }).rejects.toThrow(/statement/);
});

test("addStatement: types are namespaced", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement(
    "A Person has exactly one name which must be a string.",
  );

  await modeler.addNamespace("foo", "https://example.com/ns/foo");
  modeler.activeNamespace = "foo";
  await modeler.addStatement(
    "A Person has exactly one name which must be a string.",
  );

  expect(modeler.types.hr.Person.oid).toBeDefined();
  expect(modeler.types.foo.Person.oid).toBeDefined();
  expect(modeler.types.hr.Person.oid).not.toBe(modeler.types.foo.Person.oid);
});

test("addStatement: statements can be repeated", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement(
    "A Person has exactly one name which must be a string.",
  );
  await modeler.addStatement(
    "A Person has exactly one name which must be a string.",
  );
});

test("addStatement: active namespace is needed", async () => {
  const modeler: Modeler = new Modeler();
  await modeler.initialize();
  await modeler.addNamespace(
    "hr",
    "https://type.link.model.tools/ns/tlm-sample-hr/",
  );
  await expect(async () => {
    await modeler.addStatement(
      "A Person has exactly one name which must be a string.",
    );
  }).rejects.toThrow(/Active namespace/i);
});

test("addStatement: 'A' and 'An' are both ok", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement(
    "An Individual has exactly one name which must be an integer.",
  );
});

test("addStatement: identifier definitions", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement(
    "A Person is identified by id which must be a URI.",
  );
  const link = modeler.links.hr.Person.id;
  expect(link).toBeDefined();
  expect(link.isPrimaryId).toBe(true);
});

test("addStatement: has at most one", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement(
    "A Team has at most one name which must be a string.",
  );
  const link = modeler.links.hr.Team.name;
  expect(link).toBeDefined();
  expect(link.isMandatory).toBe(false);
  expect(link.isSingular).toBe(true);
  expect(link.isPrimaryId).toBe(false);
});

test("addStatement: has at least one", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement(
    "A Team has at least one lead which must be a Person.",
  );
  const link = modeler.links.hr.Team.lead;
  expect(link).toBeDefined();
  expect(link.isMandatory).toBe(true);
  expect(link.isSingular).toBe(false);
  expect(link.isPrimaryId).toBe(false);
});

test("addStatement: can have some", async () => {
  const modeler = await newHrModeler();

  await modeler.addStatement(
    "A Person can have some team each of which must be a Team.",
  );
  const link = modeler.links.hr.Person.team;
  expect(link).toBeDefined();
  expect(link.isMandatory).toBe(false);
  expect(link.isSingular).toBe(false);
  expect(link.isPrimaryId).toBe(false);
});

test("addStatement: is a kind of", async () => {
  const modeler: Modeler = new Modeler();
  await modeler.initialize();
  await modeler.addNamespace(
    "req",
    "https://type.link.model.tools/ns/tlm-sample-requirements/",
  );
  modeler.activeNamespace = "req";

  await modeler.addStatement("A RequirementNumber is a kind of Name.");
  const requirementNumberType = modeler.types.req.RequirementNumber;
  const nameType = modeler.types.xs.Name;
  expect(requirementNumberType).toBeDefined();
  expect(requirementNumberType.superType).toBe(nameType.oid);
});

test("addStatement: is exactly one for", async () => {
  const modeler = await newMediaModeler();

  await modeler.addStatement(
    "An Album has at least one track which must be a Track.",
  );
  let link = modeler.links.media.Album.track;
  expect(link.isMandatory).toBe(true);
  expect(link.isSingular).toBe(false);
  expect(link.isPrimaryId).toBe(false);
  expect(link.isMandatoryTo).toBe(false);
  expect(link.isSingularTo).toBe(false);

  await modeler.addStatement("A Track is exactly one track for an Album.");
  link = modeler.links.media.Album.track;
  expect(link.isMandatory).toBe(true);
  expect(link.isSingular).toBe(false);
  expect(link.isPrimaryId).toBe(false);
  expect(link.isMandatoryTo).toBe(true);
  expect(link.isSingularTo).toBe(true);
});

test("addStatement: must be for", async () => {
  const modeler: Modeler = await newMediaModeler();

  await modeler.addStatement(
    "A Song can have some rendition which must be a Track.",
  );
  await modeler.addStatement("A Track must be a rendition for a Song.");
  const link = modeler.links.media.Song.rendition;
  expect(link.isMandatory).toBe(false);
  expect(link.isSingular).toBe(false);
  expect(link.isMandatoryTo).toBe(true);
  expect(link.isSingularTo).toBe(false);
});

test("addStatement: type description", async () => {
  const modeler: Modeler = await newMediaModeler();

  await modeler.addStatement('An Album is a "collection of songs".');
  const type = modeler.types.media.Album;
  expect(type.description).toBe("collection of songs");
});

test("addStatement: support extra whitespace", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement(`
    A  Person  has
        exactly   one
            name
        which  must  be  a
            string
     .`);

  expect(modeler.types.hr.Person).toBeDefined();
  expect(modeler.links.hr.Person.name.fromType).toBe(
    modeler.types.hr.Person.oid,
  );
  expect(modeler.links.hr.Person.name.toType).toBe(modeler.types.xs.string.oid);
});

test("addStatement: has toggle", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement("A Person has toggle coaches.");
  const link = modeler.links.hr.Person.coaches;
  expect(link).toBeDefined();
  expect(link.isMandatory).toBe(true);
  expect(link.isSingular).toBe(true);
  expect(link.isPrimaryId).toBe(false);
  expect(link.isValue).toBe(true);
  expect(link.isToggle).toBe(true);
});

test("addStatement: plural", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement("A plural of Person is People.");
  const type = modeler.types.hr.Person;
  expect(type).toBeDefined();
  expect(type.plural).toBe("People");
});

test("addStatement: link from and target names", async () => {
  const modeler: Modeler = await newHrModeler();

  await modeler.addStatement(
    "A Person, the coachee, can have some coach which must be a Person, the coach.",
  );
  const link = modeler.links.hr.Person.coach;
  expect(link).toBeDefined();
  expect(link.fromName).toBe("coachee");
  expect(link.toName).toBe("coach");
});

test("getTypeByName: basic usage", async () => {
  let modeler: Modeler = await newHrModeler();

  expect(modeler.getTypeByName("Person")).toBeUndefined();
  await modeler.addStatement("A Person is a being regarded as an individual.");
  expect(modeler.getTypeByName("Person")).toBeDefined();
  expect(modeler.getTypeByName("hr:Person")).toBeDefined();

  // test case of no active NS
  modeler = new Modeler();
  await modeler.initialize();
  expect(modeler.getTypeByName("Person")).toBeUndefined();
});

test("getValueTypeForLink: basic usage", async () => {
  const modeler: Modeler = new Modeler();
  await modeler.initialize();
  expect(
    modeler.getValueTypeForLink(modeler.links.tlm.Type.namespace).name,
  ).toBe("Namespace");
});

test("processLinkDefinitionStatement: cover unreachable default case", async () => {
  const modeler: Modeler = new Modeler();

  await expect(async () => {
    let match: RegExpMatchArray = "a".match(/(a)/)!;
    match.groups = {
      fromType: "Person",
      rel: "flub-boxes",
      link: "things",
      othertype: "Team",
    };
    await (modeler as any).processLinkDefinitionStatement(match);
  }).rejects.toThrow(/Cannot process statement relationship/);
});

test("processReverseLinkDefinitionStatement: cover unreachable default case", async () => {
  const modeler: Modeler = new Modeler();
  await expect(async () => {
    await (modeler as any).processReverseLinkDefinitionStatement([
      "A Track flub-boxes rendition for a Song.",
      "Track",
      "flub-boxes",
      "rendition",
      "Song",
    ]);
  }).rejects.toThrow(/Cannot process reverse statement relationship/);
});

test("constructor: inject dependencies", async () => {
  const oidGenerator = new OidGenerator();
  const namespaceModel = new NamespaceModel(oidGenerator);
  const typeModel = new TypeModel(oidGenerator, namespaceModel);
  const linkModel = new LinkModel(oidGenerator, namespaceModel, typeModel);
  expect(
    new Modeler(oidGenerator, namespaceModel, typeModel, linkModel),
  ).toBeDefined();
});

async function newHrModeler() {
  return newModeler("hr", "https://type.link.model.tools/ns/tlm-sample-hr/");
}

async function newMediaModeler() {
  return newModeler(
    "media",
    "https://type.link.model.tools/ns/tlm-sample-media/",
  );
}

async function newModeler(prefix: string, uri: string) {
  const modeler: Modeler = new Modeler();
  await modeler.initialize();
  await modeler.addNamespace(prefix, uri);
  modeler.activeNamespace = prefix;
  return modeler;
}
