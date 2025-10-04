import { beforeEach } from "node:test";
import { emptyResult, mockClientQuery, rowsResults } from "../../__mocks__/pg";
import { Pool } from "pg";
import { OidGenerator as CoreGenerator } from "@typelinkmodel/tlm-core-model/lib/modeler/oid";
import { OidGenerator } from "../../src/modeler/oid";
import { NamespaceModel } from "../../src/modeler/namespace";

class ErrorOidGenerator extends CoreGenerator {
  async nextOid(): Promise<number> {
    throw new Error("Should not be called");
  }
}

function mockNamespaceInitializeQueryForNamespaces() {
  mockClientQuery
    .mockReturnValueOnce(emptyResult("BEGIN"))
    .mockReturnValueOnce(rowsResults("SELECT ...", []))
    .mockReturnValueOnce(emptyResult("COMMIT"));
}

function mockNamespaceAddNamespaceQuery() {
  mockClientQuery
    .mockReturnValueOnce(emptyResult("BEGIN"))
    .mockReturnValueOnce(
      rowsResults("CALL tlm__insert_namespace ...", [{ oid: 4242 }]),
    )
    .mockReturnValueOnce(emptyResult("COMMIT"));
}

async function addNamespaceTo(namespaceModel: NamespaceModel) {
  mockNamespaceAddNamespaceQuery();
  const ns = await namespaceModel.addNamespace(
    "hr",
    "https://type.link.model.tools/ns/tlm-sample-hr/",
    "HR Example",
  );
  expect(ns.oid).toBeDefined();
  expect(namespaceModel.namespaceMap.hr.oid).toEqual(ns.oid);
}

function createNamespaceModel() {
  const pool = new Pool();
  const oidGenerator = new OidGenerator(pool);
  return new NamespaceModel(pool, oidGenerator);
}

async function createAndInitializeNamespaceModel() {
  const namespaceModel = createNamespaceModel();

  mockNamespaceInitializeQueryForNamespaces();
  await namespaceModel.initialize();
  return namespaceModel;
}

describe("NamespaceModel", () => {
  beforeEach(() => {
    mockClientQuery.mockReset();
  });

  it("can be constructed with a default OidGenerator", async () => {
    const pool = new Pool();
    new NamespaceModel(pool);
  });

  it("should allow initialize() to be called more than once", async () => {
    const namespaceModel = await createAndInitializeNamespaceModel();
    await namespaceModel.initialize();
    await namespaceModel.initialize();
  });

  it("should contain the tlm namespace on empty db", async () => {
    const namespaceModel = await createAndInitializeNamespaceModel();
    const tlmNamespace = namespaceModel.findNamespaceByOid(1);
    expect(tlmNamespace.prefix).toBe("tlm");
  });

  it("should fetch namespaces from the db on initialize", async () => {
    const namespaceModel = createNamespaceModel();
    const prefix = "foo";
    mockClientQuery
      .mockReturnValueOnce(emptyResult("BEGIN"))
      .mockReturnValueOnce(
        rowsResults("SELECT ...", [
          {
            oid: 1,
            prefix: "tlm",
            uri: "https://type.link.model.tools/ns/tlm/",
            description: "The Core TLM namespace.",
          },
          {
            oid: 2,
            prefix: "xs",
            uri: "http://www.w3.org/2001/XMLSchema",
            description: "Namespaces for XML Schema DataTypes.",
          },
          {
            oid: 3,
            prefix,
            uri: "https://type.link.model.tools/ns/tlm-sample-foo/",
            description: "Sample namespace.",
          },
        ]),
      )
      .mockReturnValueOnce(emptyResult("COMMIT"));
    await namespaceModel.initialize();
    expect(namespaceModel.namespaceMap.foo).toBeDefined();
  });

  it("should allow adding a namespace", async () => {
    const namespaceModel = await createAndInitializeNamespaceModel();
    await addNamespaceTo(namespaceModel);
  });

  it("should allow adding a namespace twice", async () => {
    const namespaceModel = await createAndInitializeNamespaceModel();
    await addNamespaceTo(namespaceModel);
    await namespaceModel.addNamespace(
      "hr",
      "https://type.link.model.tools/ns/tlm-sample-hr/",
      "HR Example",
    );
  });

  it("should not allow adding a namespace with an oid", async () => {
    const namespaceModel = await createAndInitializeNamespaceModel();
    await expect(async () => {
      await namespaceModel.addNamespace(
        "foo",
        "https://type.link.model.tools/ns/tlm-sample-foo/",
        '"Sample namespace."',
        4242,
      );
    }).rejects.toThrow(/oid/);
  });

  it("should not use OidGenerator", async () => {
    const pool = new Pool();
    const oidGenerator = new ErrorOidGenerator();
    const namespaceModel = new NamespaceModel(pool, oidGenerator);
    mockNamespaceInitializeQueryForNamespaces();
    await namespaceModel.initialize();
    await addNamespaceTo(namespaceModel);
  });
});
