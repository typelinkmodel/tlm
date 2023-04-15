import { LinkModel } from "../../src/modeler/link";
import { NamespaceModel } from "../../src/modeler/namespace";
import { OidGenerator } from "../../src/modeler/oid";
import { TypeModel } from "../../src/modeler/type";

// note: most of LinkModeler is already tested through modeler.test.ts

test("initialize(): can safely be called more than once", async () => {
  const model: LinkModel = new LinkModel();
  await model.initialize();
  await model.initialize();
  await model.initialize();
});

test("addReverseMandatoryLink(): reject link rewiring", async () => {
  const oidGenerator = new OidGenerator();
  const namespaceModel = new NamespaceModel(oidGenerator);
  const typeModel = new TypeModel(oidGenerator, namespaceModel);
  const linkModel = new LinkModel(oidGenerator, namespaceModel, typeModel);
  await linkModel.initialize();

  await namespaceModel.addNamespace("foo", "example://foo");
  namespaceModel.activeNamespacePrefix = "foo";
  await typeModel.addType("Foo");
  await typeModel.addType("Bar");
  await typeModel.addType("Bar2");
  await linkModel.addLink({ fromType: "Foo", toType: "Bar", name: "bar" });
  await expect(
    (() => linkModel.addReverseMandatoryLink("Bar2", "Foo", "bar"))()
  ).rejects.toThrowError(/Existing relationship/);
});
