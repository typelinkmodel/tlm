import {Pool} from "pg";
import {mockClientQuery, mockClientRelease} from "../../__mocks__/pg";
import {OidGenerator} from "../../src/modeler/oid";

function emptyResult(command: string = "") {
    return Promise.resolve({
        command,
        rowCount: 0,
        oid: 0,
        fields: [],
    });
}

function rowsResults(command: string, rows: any[]) {
    return Promise.resolve({
        command,
        rows,
        rowCount: 0,
        oid: 0,
        fields: [],
    });
}

describe("OidGenerator", () => {
    beforeEach(() => {
        mockClientQuery.mockReset();
    });

    it("should return oid values", async () => {
        const oid = 42;

        mockClientQuery
            .mockReturnValueOnce(emptyResult("BEGIN"))
            .mockReturnValueOnce(emptyResult("CALL ..."))
            .mockReturnValueOnce(rowsResults("SELECT ...", [
                { oid },
            ]))
            .mockReturnValueOnce(emptyResult("COMMIT"));

        const pool: Pool = new Pool();
        const oidGenerator: OidGenerator = new OidGenerator(pool);
        oidGenerator.initialize();
        const result = await oidGenerator.nextOid();
        expect(result).toBe(oid);
        expect(mockClientRelease).toHaveBeenCalled();
    });

    it("should release clients on error", async () => {
        mockClientQuery.mockImplementation(() => {
            throw new Error("mock error");
        });

        const pool: Pool = new Pool();
        const oidGenerator: OidGenerator = new OidGenerator(pool);
        oidGenerator.initialize();
        try {
            await oidGenerator.nextOid();
        } catch (e) {
            expect(e.toString().match(/mock error/));
        }
        expect(mockClientRelease).toHaveBeenCalled();
    });
});
