import {Loader as CoreLoader} from "@typelinkmodel/tlm-core-db";
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
        // TODO get variables from environment
        host: "localhost",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "tlm",
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

export class Loader extends CoreLoader {
    private _world: World;

    // noinspection JSUnusedGlobalSymbols
    constructor(world: World) {
        super();
        this._world = world;
    }
}

export class Reader extends CoreReader {
    private _world: World;

    // noinspection JSUnusedGlobalSymbols
    constructor(world: World) {
        super();
        this._world = world;
    }
}

export class Searcher extends CoreSearcher {
    private _world: World;

    // noinspection JSUnusedGlobalSymbols
    constructor(world: World) {
        super();
        this._world = world;
    }
}
