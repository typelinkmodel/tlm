import { Loader as CoreLoader } from "@typelinkmodel/tlm-core-db";
import { TlmdLoader } from "@typelinkmodel/tlm-core-db/lib/loader/tlmd";
import { Modeler as CoreModeler } from "@typelinkmodel/tlm-core-model";
import type { World } from "../world";

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
    super([new TlmdLoader(world.modeler)]);
    this._world = world;
  }
}
