import {Modeler as PgSqlModeler} from "@typelinkmodel/tlm-pgsql";
import {Pool} from "pg";
import {World} from "../world";

// noinspection JSUnusedGlobalSymbols
export class Modeler extends PgSqlModeler {
    private _world: World;

    // noinspection JSUnusedGlobalSymbols
    constructor(world: World) {
        const pool = new Pool({
            // TODO get variables from environment
            host: "localhost",
            port: 5432,
            user: "postgres",
            password: "postgres",
            database: "tlm",
        });
        super(pool);
        this._world = world;
    }
}
