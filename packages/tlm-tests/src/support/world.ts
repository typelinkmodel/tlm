import {IModeler} from "@typelinkmodel/tlm-core-model";
import {setWorldConstructor} from "cucumber";

const DEFAULT_ASSEMBLY = "memory";

export class World {
    private readonly _parameters: {[key: string]: any};
    private readonly _attach: (value: any, mimeType?: string) => any;
    private _assembly: any;
    private _modeler: any;

    constructor(options: {[key: string]: any}) {
        this._attach = options.attach;
        this._parameters = options.parameters;
        this.loadAssembly();
    }

    // noinspection JSUnusedGlobalSymbols
    public attach(value: any, mimeType?: string) {
        return this._attach(value, mimeType);
    }

    // noinspection JSUnusedGlobalSymbols
    public get parameters(): {[key: string]: any} {
        return this._parameters;
    }

    public get modeler(): IModeler {
        if (this._modeler) {
            return this._modeler;
        }
        this._modeler = new this._assembly.Modeler(this);
        return this._modeler;
    }

    private chooseAssembly(): string {
        if (this.parameters.assembly) {
            const value: string = this.parameters.assembly;
            if (value === "default") {
                return DEFAULT_ASSEMBLY;
            }
            return value;
        } else {
            return DEFAULT_ASSEMBLY;
        }
    }

    private loadAssembly(): void {
        const assembly: string = this.chooseAssembly();
        this._assembly = require(`./assemblies/${assembly}`);
    }
}

setWorldConstructor(World);
