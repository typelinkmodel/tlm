import {IModeler, Modeler, TlmFact, TlmLink, TlmObject, TlmType} from "@typelinkmodel/tlm-core-model";
import { readFileSync } from "fs";
import { safeLoad } from "js-yaml";
import {ILoader, IReader, ISearcher} from "../api";
import {Reader} from "../reader";
import {Searcher} from "../searcher";

export class Loader implements ILoader {
    private _modeler: IModeler;
    private _reader: IReader;
    private _searcher: ISearcher;

    constructor(modeler: IModeler = new Modeler(), reader: IReader = new Reader(),
                searcher: ISearcher = new Searcher()) {
        this._modeler = modeler;
        this._reader = reader;
        this._searcher = searcher;
    }

    public async loadFile(filename: string): Promise<void> {
        if (filename.endsWith(".yml") || filename.endsWith(".yaml")) {
            return await this.loadYaml(filename);
        } else {
            throw new Error(`Cannot recognize file type of ${filename}`);
        }
    }

    private async loadYaml(filename: string): Promise<void> {
        const doc = safeLoad(readFileSync(filename, "utf8"));
        if (!doc.hasOwnProperty("data")) {
            throw new Error(`Expect yaml file to start with data:`);
        }
        const data = doc.data;
        await this.loadNamespaces(data);
        await this.loadObjects(data);
    }

    private async loadNamespaces(data: any): Promise<void> {
        if (data.hasOwnProperty("namespaces")) {
            for (const [prefixObject, uriObject] of Object.entries(data.namespaces)) {
                if (uriObject !== null && uriObject !== undefined) {
                    const prefix = String(prefixObject);
                    const uri = String(uriObject);
                    await this._modeler.addNamespace(prefix, uri);
                }
            }
        }
    }

    private async loadObjects(data: any): Promise<void> {
        if (data.hasOwnProperty("objects")) {
            // ids and value links
            let i = 0;
            for (const object of data.objects) {
                await this.loadObjectBasic(object, i);
                i++;
            }
            // links targeting other objects
            i = 0;
            for (const object of data.objects) {
                await this.loadObjectLinks(object, i);
                i++;
            }
        }
    }

    private async loadObjectBasic(object: any, i: number): Promise<void> {
        if (!object.hasOwnProperty("id")) {
            throw new Error(`Encountered object ${i} without id!`);
        }
        if (!object.hasOwnProperty("type")) {
            throw new Error(`Encountered object ${i} without type!`);
        }
        const id = object.id;
        const type = object.type;
        // const typeObj: TlmType = await this._modeler.getTypeByName(type);
        // const namespace = this._modeler.getNamespaceById(typeObj.namespace);
        // const linkObj: TlmLink = await this._modeler.getPrimaryIdLink(typeObj);
        // const link = linkObj.name;
        // const currentObject: TlmObject|undefined = await this._searcher.findUnique(
        //     {type, link, value: id});

        throw new Error("Not implemented!");
    }

    private async loadObjectLinks(object: any, i: number): Promise<void> {
        throw new Error("Not implemented!");
    }
}
