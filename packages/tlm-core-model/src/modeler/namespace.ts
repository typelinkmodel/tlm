import { ITlmNamespaceMap } from "../api";
import { loadCoreSchema, TLM_CORE_NAMESPACES, TlmNamespace } from "../core";
import { OidGenerator } from "./oid";

export class NamespaceModel {
  private _namespaces: TlmNamespace[] = [];
  private _namespaceMapCache?: ITlmNamespaceMap = undefined;
  protected _initialized = false;
  private _tlmNamespace: TlmNamespace | undefined = undefined;
  private _xsNamespace: TlmNamespace | undefined = undefined;
  private _activeNamespace?: TlmNamespace;
  private readonly _oidGenerator: OidGenerator;

  constructor(oidGenerator: OidGenerator = new OidGenerator()) {
    this._oidGenerator = oidGenerator;
  }

  public get namespaceMap(): ITlmNamespaceMap {
    if (this._namespaceMapCache !== undefined) {
      return this._namespaceMapCache;
    }
    const result: ITlmNamespaceMap = {};
    for (const ns of this._namespaces) {
      result[ns.prefix] = ns;
    }
    this._namespaceMapCache = result;
    return result;
  }

  public get namespaces(): TlmNamespace[] {
    return this._namespaces;
  }

  public get tlm(): TlmNamespace {
    return this._tlmNamespace!;
  }

  public get xs(): TlmNamespace {
    return this._xsNamespace!;
  }

  public get activeNamespace(): TlmNamespace | undefined {
    return this._activeNamespace;
  }

  public getActiveNamespaceOid(): number {
    if (!this._activeNamespace) {
      throw new Error("Active namespace not set");
    }
    return this._activeNamespace.oid;
  }

  public get activeNamespacePrefix(): string {
    if (this.activeNamespace === undefined) {
      throw new Error("Active namespace not set");
    }
    return this.activeNamespace.prefix;
  }

  public set activeNamespacePrefix(value: string) {
    if (value === undefined || value === null) {
      throw new Error(`Cannot deactivate namespace`);
    }
    if (value === "tlm" || value === "xs") {
      throw new Error(`You should not modify the built-in namespace ${value}`);
    }
    this._activeNamespace = this.findNamespaceByPrefix(value);
  }

  public async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    loadCoreSchema();

    await this._oidGenerator.initialize();

    this._namespaces = TLM_CORE_NAMESPACES.concat([]);
    this._tlmNamespace = this.namespaceMap.tlm;
    this._xsNamespace = this.namespaceMap.xs;
  }

  public async addNamespace(
    prefix: string,
    uri: string,
    description?: string,
    oid?: number,
  ): Promise<TlmNamespace> {
    const oidGiven = oid !== undefined;

    for (const existingNamespace of this._namespaces) {
      const prefixMatches = existingNamespace.prefix === prefix;
      const uriMatches = existingNamespace.uri === uri;
      const oidMatches = existingNamespace.oid === oid;

      if (prefixMatches) {
        if (!uriMatches) {
          throw new Error(
            `Namespace with prefix ${prefix} already exists with URI ${existingNamespace.uri}, cannot change to URI ${uri}`,
          );
        }
        if (oidGiven && !oidMatches) {
          throw new Error(
            `Namespace with prefix ${prefix} already exists with oid ${existingNamespace.oid}, cannot change to oid ${oid}`,
          );
        }
        return existingNamespace;
      } else if (uriMatches) {
        throw new Error(
          `Namespace with uri ${uri} already exists with prefix ${existingNamespace.prefix}, cannot change to prefix ${prefix}`,
        );
      } else if (oidGiven && oidMatches) {
        throw new Error(
          `Namespace with oid ${oid} already exists with prefix ${existingNamespace.prefix}, cannot change to prefix ${prefix}`,
        );
      }
    }

    const newOid = oid !== undefined ? oid : await this._oidGenerator.nextOid();

    const newNamespace = new TlmNamespace(newOid, prefix, uri, description);
    this._namespaces.push(newNamespace);
    this._namespaceMapCache = undefined;
    return newNamespace;
  }

  public findNamespaceByOid(oid: number): TlmNamespace {
    for (const n of this._namespaces) {
      if (n.oid === oid) {
        return n;
      }
    }
    throw new Error(`No namespace with oid ${oid}`);
  }

  public findNamespaceByPrefix(prefix: string): TlmNamespace {
    for (const n of this._namespaces) {
      if (n.prefix === prefix) {
        return n;
      }
    }
    throw new Error(`No Namespace with prefix ${prefix}`);
  }
}
