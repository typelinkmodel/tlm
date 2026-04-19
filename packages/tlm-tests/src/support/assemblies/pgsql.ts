/* eslint-disable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-unsafe-return */

import {
  Reader as CoreReader,
  Searcher as CoreSearcher,
} from "@typelinkmodel/tlm-core-db";
import { LinkModel } from "@typelinkmodel/tlm-core-model/lib/modeler/link";
import { TypeModel } from "@typelinkmodel/tlm-core-model/lib/modeler/type";
import { Modeler as PgSqlModeler } from "@typelinkmodel/tlm-pgsql";
import { NamespaceModel } from "@typelinkmodel/tlm-pgsql/lib/modeler/namespace";
import { OidGenerator } from "@typelinkmodel/tlm-pgsql/lib/modeler/oid";
import { Pool } from "pg";
import type { World } from "../world";
import { Loader as CoreLoader } from "./memory";

function getPool(world: World): Pool {
  // biome-ignore lint/suspicious/noPrototypeBuiltins: tsconfig target is ES2018, Object.hasOwn is ES2022
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
    const pool = getPool(world);
    const oidGenerator = new OidGenerator(pool);
    const namespaceModel = new NamespaceModel(pool, oidGenerator);
    const typeModel = new TypeModel(oidGenerator, namespaceModel);
    const linkModel = new LinkModel(oidGenerator, namespaceModel, typeModel);
    super(pool, oidGenerator, namespaceModel, typeModel, linkModel);
    this._world = world;
  }
}

// noinspection JSUnusedGlobalSymbols
export class Loader extends CoreLoader {}

// noinspection JSUnusedGlobalSymbols
export class Reader extends CoreReader {}

// noinspection JSUnusedGlobalSymbols
export class Searcher extends CoreSearcher {}
