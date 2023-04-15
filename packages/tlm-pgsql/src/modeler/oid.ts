import { TlmType } from "@typelinkmodel/tlm-core-model";
import { OidGenerator as CoreGenerator } from "@typelinkmodel/tlm-core-model/lib/modeler/oid";
import { Pool, QueryResult, QueryResultRow } from "pg";
import { tx } from "../pg";

export interface IOidResultRow extends QueryResultRow {
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
    return tx(this._pool, async (client) => {
      await client.query("CALL tlm__insert_object($1);", [TlmType.TYPE_TYPE]);
      const result: QueryResult<IOidResultRow> = await client.query<
        IOidResultRow,
        Array<string>
      >("SELECT tlm__current_oid()::int AS oid;");
      return result.rows[0].oid;
    });
  }
}
