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
