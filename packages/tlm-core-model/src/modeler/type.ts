import { ITlmTypeMap } from "../api";
import { loadCoreSchema, TLM_CORE_TYPES, TlmType } from "../core";
import { NamespaceModel } from "./namespace";
import { OidGenerator } from "./oid";

export class TypeModel {
  private _types: TlmType[] = [];
  private _typeMapCache?: ITlmTypeMap = undefined;
  private _initialized = false;
  private readonly _oidGenerator: OidGenerator;
  private readonly _namespaceModel: NamespaceModel;

  constructor(
    oidGenerator: OidGenerator = new OidGenerator(),
    namespaceModel: NamespaceModel = new NamespaceModel(oidGenerator)
  ) {
    this._oidGenerator = oidGenerator;
    this._namespaceModel = namespaceModel;
  }

  public get typeMap(): ITlmTypeMap {
    if (this._typeMapCache !== undefined) {
      return this._typeMapCache;
    }
    const result: ITlmTypeMap = {};
    for (const ns of this._namespaceModel.namespaces) {
      result[ns.prefix] = {};
    }
    for (const t of this._types) {
      const ns = this._namespaceModel.findNamespaceByOid(t.namespace);
      result[ns.prefix][t.name] = t;
    }
    this._typeMapCache = result;
    return result;
  }

  public get types(): TlmType[] {
    return this._types;
  }

  public async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    loadCoreSchema();

    await this._oidGenerator.initialize();
    await this._namespaceModel.initialize();

    this._types = TLM_CORE_TYPES.concat([]);
  }

  public findTypeByOid(oid: number): TlmType {
    for (const t of this._types) {
      if (t.oid === oid) {
        return t;
      }
    }
    throw new Error(`No type with oid ${oid}`);
  }

  public findTypeByName(name: string): TlmType {
    if (this._namespaceModel.activeNamespace) {
      for (const t of this._types) {
        if (
          t.name === name &&
          this._namespaceModel.activeNamespace.oid === t.namespace
        ) {
          return t;
        }
      }
    }
    for (const t of this._types) {
      if (
        t.name === name &&
        (t.namespace === this._namespaceModel.tlm.oid ||
          t.namespace === this._namespaceModel.xs.oid)
      ) {
        return t;
      }
    }

    // not found, but be nice about the error if we can
    for (const t of this._types) {
      if (t.name === name) {
        const ns = this._namespaceModel.findNamespaceByOid(t.namespace);
        throw new Error(
          `Found a type ${ns.prefix}:${name}, but ${ns.prefix} is not active`
        );
      }
    }

    throw new Error(`No type with name ${name}`);
  }

  public findTypeByNameOptional(name: string): TlmType | undefined {
    try {
      return this.findTypeByName(name);
    } catch (e) {
      return undefined;
    }
  }

  public async addType(name: string): Promise<TlmType> {
    const existingType = this.findTypeByNameOptional(name);
    if (existingType) {
      return existingType;
    }

    const newType = new TlmType({
      oid: await this._oidGenerator.nextOid(),
      namespace: this._namespaceModel.getActiveNamespaceOid(),
      name: name,
    });
    this._types.push(newType);
    this._typeMapCache = undefined;
    return newType;
  }

  public async replaceType(type: TlmType): Promise<void> {
    if (type.namespace !== this._namespaceModel.getActiveNamespaceOid()) {
      throw new Error("Can only replace types in the active namespace");
    }
    const existingType = this.findTypeByOid(type.oid);
    if (type.namespace !== existingType.namespace) {
      throw new Error("Cannot move types to a new namespace");
    }
    const i = this._types.indexOf(existingType);
    this._types.splice(i, 1, type);
    this._typeMapCache = undefined;
  }
}
