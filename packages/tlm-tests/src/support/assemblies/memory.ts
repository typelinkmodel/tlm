import { Loader as CoreLoader } from "@typelinkmodel/tlm-core-db";
import { Reader as CoreReader } from "@typelinkmodel/tlm-core-db";
import { Searcher as CoreSearcher } from "@typelinkmodel/tlm-core-db";
import { TlmdLoader } from "@typelinkmodel/tlm-core-db/lib/loader/tlmd";
import { YamlLoader } from "@typelinkmodel/tlm-core-db/lib/loader/yaml";
import { Modeler as CoreModeler } from "@typelinkmodel/tlm-core-model";
import { World } from "../world";

// noinspection JSUnusedGlobalSymbols
export class Modeler extends CoreModeler {
  private _world: World;

  // noinspection JSUnusedGlobalSymbols
  constructor(world: World) {
    super();
    this._world = world;
  }
}

export class Loader extends CoreLoader {
  private _world: World;

  // noinspection JSUnusedGlobalSymbols
  constructor(world: World) {
    super([
      new TlmdLoader(world.modeler, world.reader, world.searcher),
      new YamlLoader(world.modeler, world.reader, world.searcher),
    ]);
    this._world = world;
  }
}

// noinspection JSUnusedGlobalSymbols
export class Reader extends CoreReader {
  private _world: World;

  // noinspection JSUnusedGlobalSymbols
  constructor(world: World) {
    super();
    this._world = world;
  }
}

// noinspection JSUnusedGlobalSymbols
export class Searcher extends CoreSearcher {
  private _world: World;

  // noinspection JSUnusedGlobalSymbols
  constructor(world: World) {
    super();
    this._world = world;
  }
}
