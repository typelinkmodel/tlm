import { Modeler } from "@typelinkmodel/tlm-core-model";
import { TlmdLoader } from "../../src/loader/tlmd";
import { Reader } from "../../src/reader";
import { Searcher } from "../../src/searcher";
import { join } from "path";

test("TlmdLoader supports only tlmd files", () => {
  const loader = new TlmdLoader();
  expect(loader.supportsExtension("tlmd")).toBe(true);
  expect(loader.supportsExtension("json")).toBe(false);
});

test("TlmdLoader test 001-empty", async () => {
  const modeler = await loadTest("001-empty");
  expect(modeler.activeNamespace).toBeUndefined();
});

test("TlmdLoader test 002-empty-model", async () => {
  const modeler = await loadTest("002-empty-model");
  expect(modeler.activeNamespace).toBe("hr");
  expect(modeler.namespaces.hr.uri).toBe("https://type.link.model.tools/ns/tlm-sample-hr/");
});

test("TlmdLoader test 003-simple-person-model", async () => {
  const modeler = await loadTest("003-simple-person-model");
  expect(modeler.activeNamespace).toBe("hr");
  expect(modeler.namespaces.hr.uri).toBe("https://type.link.model.tools/ns/tlm-sample-hr/");
  const personType = modeler.types.hr.Person;
  expect(personType.superType).toBe(modeler.types.tlm.Type.oid);
  expect(personType.description).toBe("being regarded as an individual");
  const link = modeler.links.hr.Person.id;
  expect(link).toBeDefined();
  expect(link.isPrimaryId).toBe(true);
});

async function loadTest(testname: string): Promise<Modeler> {
  const modeler = new Modeler();
  modeler.initialize();
  const loader = new TlmdLoader(modeler, new Reader(), new Searcher(), false, true);
  const fileName = `${testname}.tlmd`;
  const filePath = join(__dirname, "tlmd", fileName);
  await loader.loadFile(filePath);
  expect(modeler).toMatchSnapshot();
  return modeler;
}
