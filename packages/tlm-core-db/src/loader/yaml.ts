import { IModeler, Modeler } from "@typelinkmodel/tlm-core-model";
import { readFileSync } from "fs";
import { load } from "js-yaml";
import { ILoader, IReader, ISearcher } from "../api";
import { Reader } from "../reader";
import { Searcher } from "../searcher";

export class YamlLoader implements ILoader {
  private _modeler: IModeler;
  private _reader: IReader;
  private _searcher: ISearcher;

  constructor(
    modeler: IModeler = new Modeler(),
    reader: IReader = new Reader(),
    searcher: ISearcher = new Searcher()
  ) {
    this._modeler = modeler;
    this._reader = reader;
    this._searcher = searcher;
  }

  public async loadFile(filename: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment
    const doc = load(readFileSync(filename, "utf8")) as any;
    // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    if (!doc.hasOwnProperty("tlm:Facts")) {
      throw new Error(`Expect yaml file to start with tlm:Facts:`);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const facts = doc["tlm:Facts"];
    await this.loadNamespaces(facts);
    await this.loadObjects(facts);
  }

  supportsExtension(extension: string): boolean {
    return extension === "yaml";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async loadNamespaces(facts: any): Promise<void> {
    let defaultNs;

    // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    if (facts.hasOwnProperty("namespaces")) {
      for (const [prefixObject, uriObject] of Object.entries(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        facts.namespaces
      )) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async loadObjects(facts: any): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,no-prototype-builtins
    if (facts.hasOwnProperty("objects")) {
      // ids and value links
      let i = 0;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      for (const object of facts.objects) {
        await this.loadObjectBasic(object, i);
        i++;
      }
      // links targeting other objects
      i = 0;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      for (const object of facts.objects) {
        await this.loadObjectLinks(object, i);
        i++;
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async loadObjectBasic(object: any, i: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,no-prototype-builtins
    if (!object.hasOwnProperty("id")) {
      throw new Error(`Encountered object ${i} without id!`);
    }
    // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    if (!object.hasOwnProperty("type")) {
      throw new Error(`Encountered object ${i} without type!`);
    }
    // const id = object.id;
    // const type = String(object.type);
    // const typeObj: TlmType = this._modeler.getTypeByName(type);
    // const namespace = this._modeler.getNamespaceForType(typeObj);
    // const linkObj: TlmLink = await this._modeler.getPrimaryIdLink(typeObj);
    // const link = linkObj.name;
    // const currentObject: TlmObject|undefined = await this._searcher.findUnique(
    //     {type, link, value: id});

    // throw new Error("Not implemented!");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async loadObjectLinks(object: any, i: number): Promise<void> {
    // throw new Error("Not implemented!");
  }
}
