import {Modeler as CoreModeler} from "@typelinkmodel/tlm-core-model";
import {World} from "../world";

// noinspection JSUnusedGlobalSymbols
export class Modeler extends CoreModeler {
    private _world: World;

    // noinspection JSUnusedGlobalSymbols
    constructor(world: World) {
        super();
        this._world = world;
    }
}
