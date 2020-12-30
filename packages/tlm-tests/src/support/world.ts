/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types */
import {ILoader, IReader, ISearcher} from "@typelinkmodel/tlm-core-db";
import {IModeler} from "@typelinkmodel/tlm-core-model";
import {setWorldConstructor} from "@cucumber/cucumber";

const DEFAULT_ASSEMBLY = "memory";

export class World {
    private readonly _parameters: {[key: string]: any};
    private readonly _attach: (value: any, mimeType?: string) => any;
    private _assembly: any;
    private _modeler: any;
    private _loader: any;
    private _reader: any;
    private _searcher: any;

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

    public get loader(): ILoader {
        if (this._loader) {
            return this._loader;
        }
        this._loader = new this._assembly.Loader(this);
        return this._loader;
    }

    public get reader(): IReader {
        if (this._reader) {
            return this._reader;
        }
        this._reader = new this._assembly.Reader(this);
        return this._reader;
    }

    public get searcher(): ISearcher {
        if (this._searcher) {
            return this._searcher;
        }
        this._searcher = new this._assembly.Searcher(this);
        return this._searcher;
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
