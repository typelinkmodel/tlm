import {IModeler, Modeler, TlmFact, TlmLink, TlmObject, TlmType} from "@typelinkmodel/tlm-core-model";
import { readFileSync } from "fs";
import { safeLoad } from "js-yaml";
import {ILoader, IReader, ISearcher} from "../api";
import {Reader} from "../reader";
import {Searcher} from "../searcher";

export class YamlLoader implements ILoader {
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
        const doc = safeLoad(readFileSync(filename, "utf8")) as any;
        if (!doc.hasOwnProperty("tlm:Facts")) {
            throw new Error(`Expect yaml file to start with tlm:Facts:`);
        }
        const facts = doc["tlm:Facts"];
        await this.loadNamespaces(facts);
        await this.loadObjects(facts);
    }

    private async loadNamespaces(facts: any): Promise<void> {
        let defaultNs;

        if (facts.hasOwnProperty("namespaces")) {
            for (const [prefixObject, uriObject] of Object.entries(facts.namespaces)) {
                if (uriObject !== null && uriObject !== undefined) {
                    const prefix = String(prefixObject);
                    const uri = String(uriObject);
                    if (prefix === "default") {
                        defaultNs = uri;
                    } else {
                        await this._modeler.addNamespace(prefix, uri);
                    }
                }
            }
        }

        if (defaultNs !== undefined) {
            let foundNs = false;
            for (const [prefix, ns] of Object.entries(this._modeler.namespaces)) {
                if (ns.uri === defaultNs) {
                    if (prefix !== "tlm" && prefix !== "xs") {
                        this._modeler.activeNamespace = prefix;
                    }
                    foundNs = true;
                    break;
                }
            }
            if (!foundNs) {
                throw new Error(`No prefix defined for default namespace ${defaultNs}`);
            }
        }
    }

    private async loadObjects(facts: any): Promise<void> {
        if (facts.hasOwnProperty("objects")) {
            // ids and value links
            let i = 0;
            for (const object of facts.objects) {
                await this.loadObjectBasic(object, i);
                i++;
            }
            // links targeting other objects
            i = 0;
            for (const object of facts.objects) {
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
        const type: string = String(object.type);
        const typeObj: TlmType = this._modeler.getTypeByName(type);
        // const namespace = this._modeler.getNamespaceForType(typeObj);
        // const linkObj: TlmLink = await this._modeler.getPrimaryIdLink(typeObj);
        // const link = linkObj.name;
        // const currentObject: TlmObject|undefined = await this._searcher.findUnique(
        //     {type, link, value: id});

        // throw new Error("Not implemented!");
    }

    private async loadObjectLinks(object: any, i: number): Promise<void> {
        // throw new Error("Not implemented!");
    }
}
