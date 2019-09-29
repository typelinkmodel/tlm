import {NamespaceModel} from "../../src/modeler/namespace";

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
