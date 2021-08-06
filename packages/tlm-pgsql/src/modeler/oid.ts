import { TlmType } from "@typelinkmodel/tlm-core-model";
import { OidGenerator as CoreGenerator } from "@typelinkmodel/tlm-core-model/lib/modeler/oid";
import { Pool, QueryResult, QueryResultRow } from "pg";

interface IOidResultRow extends QueryResultRow {
  oid: number;
}

export class OidGenerator extends CoreGenerator {
  private readonly _pool: Pool;

  constructor(pool: Pool) {
    super();
    this._pool = pool;
  }

  public async nextOid(): Promise<number> {
    // todo this is creating 'broken' tlm__object entries
    const client = await this._pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("CALL tlm__insert_object($1);", [TlmType.TYPE_TYPE]);
      const result: QueryResult<IOidResultRow> = await client.query<
        IOidResultRow,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        any
      >("SELECT tlm__current_oid()::int AS oid;");
      await client.query("COMMIT");
      return result.rows[0].oid;
    } catch (e) {
      try {
        await client.query("ROLLBACK");
      } catch (e2) {
        // ignored
      }
      throw e;
    } finally {
      client.release();
    }
  }
}
