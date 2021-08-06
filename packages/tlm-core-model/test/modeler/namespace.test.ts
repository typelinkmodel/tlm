import { NamespaceModel } from "../../src/modeler/namespace";

// note: most of NamespaceModeler is already tested through modeler.test.ts

test("initialize(): can safely be called more than once", async () => {
  const model: NamespaceModel = new NamespaceModel();
  model.initialize();
  model.initialize();
  model.initialize();
});

test("findNamespaceByOid: error on unknown oid", () => {
  const model = new NamespaceModel();
  expect(() => model.findNamespaceByOid(1000000)).toThrowError(/oid/);
});

test("activeNamespacePrefix: error on inactive namespace", () => {
  const model = new NamespaceModel();
  expect(() => model.activeNamespacePrefix).toThrowError(/Active namespace/);
});

test("activeNamespacePrefix: cannot unset", () => {
  const model = new NamespaceModel();
  expect(() => {
    // @ts-ignore
    model.activeNamespacePrefix = null as string;
  }).toThrowError(/Cannot deactivate/);
  expect(() => {
    // @ts-ignore
    model.activeNamespacePrefix = undefined as string;
  }).toThrowError(/Cannot deactivate/);
});
