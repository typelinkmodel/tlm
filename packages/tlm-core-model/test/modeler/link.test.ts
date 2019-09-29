import {LinkModel} from "../../src/modeler/link";

// note: most of LinkModeler is already tested through modeler.test.ts

test("initialize(): can safely be called more than once", async () => {
    const model: LinkModel = new LinkModel();
    model.initialize();
    model.initialize();
    model.initialize();
});
