import { NamespaceModel as CoreNamespaceModel } from "@typelinkmodel/tlm-core-model/lib/modeler/namespace";
import { OidGenerator as CoreGenerator } from "@typelinkmodel/tlm-core-model/lib/modeler/oid";
import { IOidResultRow, OidGenerator } from "./oid";
import { Pool, QueryResult } from "pg";
import { TlmNamespace } from "@typelinkmodel/tlm-core-model";
import { tx } from "../pg";


interface ITmlNamespaceResultRow {
  oid: number;
  prefix: string;
  uri: string;
  description?: string;
}

export class NamespaceModel extends CoreNamespaceModel {
  private readonly _pool: Pool;

  constructor(pool: Pool, oidGenerator: CoreGenerator = new OidGenerator(pool)) {
    super(oidGenerator);
    this._pool = pool;
  }

  public async initialize(): Promise<void> {
    if(this._initialized) {
      return;
    }
    await super.initialize();
    return this.retrieveNamespaces();
  }

  async addNamespace(prefix: string, uri: string, description?: string, oid?: number): Promise<TlmNamespace> {
    if (oid !== undefined) {
      throw new Error(`PgSQL NamespaceModel does not allow providing oid`);
    }

    // todo make method out of this lookup
    const ns = super.namespaceMap[prefix];
    if (ns !== undefined) {
      return ns;
    }

    return tx(this._pool, async (client) => {
      const result: QueryResult<IOidResultRow> = await client.query<
        IOidResultRow,
        Array<string|undefined>
      >("CALL tlm__insert_namespace($1, $2, $3);", [prefix, uri, description]);
      const oid = result.rows[0].oid;
      return super.addNamespace(prefix, uri, description, oid);
    });
  }

  private async retrieveNamespaces(): Promise<void> {
     return tx(this._pool, async (client) => {
       const result: QueryResult<ITmlNamespaceResultRow> = await client.query(
        "SELECT oid, prefix, uri, description FROM tlm__namespaces;");
       for (const row of result.rows) {
         await super.addNamespace(row.prefix, row.uri, row.description, row.oid);
       }
    });
  }
}
