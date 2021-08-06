import { IModeler, Modeler } from "@typelinkmodel/tlm-core-model";
import { ILoader, IReader, ISearcher } from "../api";
import { Reader } from "../reader";
import { Searcher } from "../searcher";
import { TlmdLoader } from "./tlmd";
import { YamlLoader } from "./yaml";

// noinspection JSUnusedGlobalSymbols
export class Loader implements ILoader {
  private _modeler: IModeler;
  private _reader: IReader;
  private _searcher: ISearcher;
  private _yamlLoader: YamlLoader;
  private _tlmdLoader: TlmdLoader;

  constructor(
    modeler: IModeler = new Modeler(),
    reader: IReader = new Reader(),
    searcher: ISearcher = new Searcher()
  ) {
    this._modeler = modeler;
    this._reader = reader;
    this._searcher = searcher;
    this._yamlLoader = new YamlLoader(modeler, reader, searcher);
    this._tlmdLoader = new TlmdLoader(modeler, reader, searcher);
  }

  public async loadFile(filename: string): Promise<void> {
    if (filename.endsWith(".yml") || filename.endsWith(".yaml")) {
      return await this._yamlLoader.loadFile(filename);
    } else if (filename.endsWith(".tlmd")) {
      return await this._tlmdLoader.loadFile(filename);
    } else {
      throw new Error(`Cannot recognize file type of ${filename}`);
    }
  }
}
