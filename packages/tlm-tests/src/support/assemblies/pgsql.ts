import {Loader as CoreLoader} from "./memory";
import {Reader as CoreReader} from "@typelinkmodel/tlm-core-db";
import {Searcher as CoreSearcher} from "@typelinkmodel/tlm-core-db";
import {Modeler as PgSqlModeler} from "@typelinkmodel/tlm-pgsql";
import {Pool} from "pg";
import {World} from "../world";

function getPool(world: World) {
    if (world.hasOwnProperty("pool")) {
        // @ts-ignore
        return world.pool;
    }
    // @ts-ignore
    world.pool = new Pool({
        host: process.env.POSTGRES_HOST || "localhost",
        port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "postgres",
        database: process.env.POSTGRES_DATABASE || "tlm",
    });
    // @ts-ignore
    return world.pool;
}

// noinspection JSUnusedGlobalSymbols
export class Modeler extends PgSqlModeler {
    private _world: World;

    // noinspection JSUnusedGlobalSymbols
    constructor(world: World) {
        super(getPool(world));
        this._world = world;
    }
}

export class Loader extends CoreLoader {}

export class Reader extends CoreReader {}

export class Searcher extends CoreSearcher {}
