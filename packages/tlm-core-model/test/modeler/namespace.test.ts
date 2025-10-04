import { NamespaceModel } from "../../src/modeler/namespace";

// note: most of NamespaceModeler is already tested through modeler.test.ts

test("initialize(): can safely be called more than once", async () => {
  const model: NamespaceModel = new NamespaceModel();
  await model.initialize();
  await model.initialize();
  await model.initialize();
});

test("findNamespaceByOid: error on unknown oid", () => {
  const model = new NamespaceModel();
  expect(() => model.findNamespaceByOid(1000000)).toThrow(/oid/);
});

test("activeNamespacePrefix: error on inactive namespace", () => {
  const model = new NamespaceModel();
  expect(() => model.activeNamespacePrefix).toThrow(/Active namespace/);
});

test("activeNamespacePrefix: cannot unset", () => {
  const model = new NamespaceModel();
  expect(() => {
    // @ts-ignore
    model.activeNamespacePrefix = null as string;
  }).toThrow(/Cannot deactivate/);
  expect(() => {
    // @ts-ignore
    model.activeNamespacePrefix = undefined as string;
  }).toThrow(/Cannot deactivate/);
});

test("addNamespace: cannot redefine invariants", async () => {
  const model = new NamespaceModel();
  await model.initialize();
  const prefix = "foo";
  const uri = "https://example.com/ns";
  const description = "Sample ns.";
  const oid = 4242;

  await model.addNamespace(prefix, uri, description, oid);
  await model.addNamespace(prefix, uri, description);
  await model.addNamespace(prefix, uri);
  await model.addNamespace(prefix, uri, "Sample namespace.", oid);
  await model.addNamespace(prefix, uri, "Sample namespace.");

  await expect(async () => {
    await model.addNamespace(
      prefix,
      "https://example.com/illegal",
      description,
      oid,
    );
  }).rejects.toThrow(/uri/i);

  await expect(async () => {
    await model.addNamespace("bar", uri, description, oid);
  }).rejects.toThrow(/prefix/i);

  await expect(async () => {
    await model.addNamespace(prefix, uri, description, 424242);
  }).rejects.toThrow(/oid/i);
});
