import { TlmType } from "../../src";
import { NamespaceModel } from "../../src/modeler/namespace";
import { OidGenerator } from "../../src/modeler/oid";
import { TypeModel } from "../../src/modeler/type";

// note: most of TypeModeler is already tested through modeler.test.ts

test("initialize(): can safely be called more than once", async () => {
  const model: TypeModel = new TypeModel();
  await model.initialize();
  await model.initialize();
  await model.initialize();
});

test("findTypeByOid: error on unknown oid", () => {
  const model = new TypeModel();
    expect(() => model.findTypeByOid(1000000)).toThrow(/oid/);
});

// weird syntax incoming to deal with expecting errors out of async functions:
//   https://github.com/facebook/jest/issues/1700

test("replaceType: no active namespace", async () => {
  const model = new TypeModel();
  const newType = new TlmType({ oid: 42, namespace: 42, name: "foo" });

    await expect((() => model.replaceType(newType))()).rejects.toThrow(
      /Active namespace not set/
    );
});

test("replaceType: outside active namespace", async () => {
  const oidGenerator = new OidGenerator();
  const namespaceModel = new NamespaceModel(oidGenerator);
  await namespaceModel.addNamespace("foo", "example://foo");
  const otherNamespace = await namespaceModel.addNamespace(
    "bar",
    "example://bar"
  );
  namespaceModel.activeNamespacePrefix = "foo";
  const model = new TypeModel(oidGenerator, namespaceModel);
  await model.initialize();

  const newType = new TlmType({
    oid: await oidGenerator.nextOid(),
    namespace: otherNamespace.oid,
    name: "Foo",
  });

    await expect((() => model.replaceType(newType))()).rejects.toThrow(
      /Can only replace types in the active namespace/
    );
});

test("replaceType: wrong namespace", async () => {
  const oidGenerator = new OidGenerator();
  const namespaceModel = new NamespaceModel(oidGenerator);
  await namespaceModel.addNamespace("foo", "example://foo");
  namespaceModel.activeNamespacePrefix = "foo";

  const model = new TypeModel(oidGenerator, namespaceModel);
  await model.initialize();

  const origType = await model.addType("Foo");

  const otherNamespace = await namespaceModel.addNamespace(
    "bar",
    "example://bar"
  );
  namespaceModel.activeNamespacePrefix = "bar";

  const newType = new TlmType({
    oid: origType.oid,
    namespace: otherNamespace.oid,
    name: "Foo",
  });

    await expect((() => model.replaceType(newType))()).rejects.toThrow(
      /Cannot move types to a new namespace/
    );
});
