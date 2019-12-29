import {TlmType} from "../../src/core";
import {NamespaceModel} from "../../src/modeler/namespace";
import {OidGenerator} from "../../src/modeler/oid";
import {TypeModel} from "../../src/modeler/type";

// note: most of TypeModeler is already tested through modeler.test.ts

test("initialize(): can safely be called more than once", async () => {
    const model: TypeModel = new TypeModel();
    model.initialize();
    model.initialize();
    model.initialize();
});

test("findTypeByOid: error on unknown oid", () => {
    const model = new TypeModel();
    expect(() => model.findTypeByOid(1000000)).toThrowError(/oid/);
});

// weird syntax incoming to deal with expecting errors out of async functions:
//   https://github.com/facebook/jest/issues/1700

test("replaceType: no active namespace", async () => {
    const model = new TypeModel();
    const newType = new TlmType(42, 42, "foo");

    await expect(
        (() => model.replaceType(newType))(),
    ).rejects.toThrowError(/Active namespace not set/);
});

test("replaceType: outside active namespace", async () => {
    const oidGenerator = new OidGenerator();
    const namespaceModel = new NamespaceModel(oidGenerator);
    await namespaceModel.addNamespace("foo", "example://foo");
    const otherNamespace = await namespaceModel.addNamespace("bar", "example://bar");
    namespaceModel.activeNamespacePrefix = "foo";
    const model = new TypeModel(oidGenerator, namespaceModel);

    const newType = new TlmType(await oidGenerator.nextOid(), otherNamespace.oid, "Foo");

    await expect(
        (() => model.replaceType(newType))(),
    ).rejects.toThrowError(/Can only replace types in the active namespace/);
});

test("replaceType: wrong namespace", async () => {
    const oidGenerator = new OidGenerator();
    const namespaceModel = new NamespaceModel(oidGenerator);
    await namespaceModel.addNamespace("foo", "example://foo");
    namespaceModel.activeNamespacePrefix = "foo";

    const model = new TypeModel(oidGenerator, namespaceModel);
    const origType = await model.addType("Foo");

    const otherNamespace = await namespaceModel.addNamespace("bar", "example://bar");
    namespaceModel.activeNamespacePrefix = "bar";

    const newType = new TlmType(origType.oid, otherNamespace.oid, "Foo");

    await expect(
        (() => model.replaceType(newType))(),
    ).rejects.toThrowError(/Cannot move types to a new namespace/);
});
