import { Pool } from "pg";
import { emptyResult, mockClientQuery, mockClientRelease, rowsResults } from "../../__mocks__/pg";
import { OidGenerator } from "../../src/modeler/oid";

describe("OidGenerator", () => {
  beforeEach(() => {
    mockClientQuery.mockReset();
  });

  it("should return oid values", async () => {
    const oid = 42;

    mockClientQuery
      .mockReturnValueOnce(emptyResult("BEGIN"))
      .mockReturnValueOnce(emptyResult("CALL ..."))
      .mockReturnValueOnce(rowsResults("SELECT ...", [{ oid }]))
      .mockReturnValueOnce(emptyResult("COMMIT"));

    const pool = new Pool();
    const oidGenerator = new OidGenerator(pool);
    await oidGenerator.initialize();
    const result = await oidGenerator.nextOid();
    expect(result).toBe(oid);
    expect(mockClientRelease).toHaveBeenCalled();
  });

  it("should release clients on error", async () => {
    mockClientQuery.mockImplementation(() => {
      throw new Error("mock error");
    });

    const pool = new Pool();
    const oidGenerator = new OidGenerator(pool);
    await oidGenerator.initialize();
    await expect(async () => {
      await oidGenerator.nextOid();
    }).rejects.toThrowError(/mock error/);
    expect(mockClientRelease).toHaveBeenCalled();
  });
});
