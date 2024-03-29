import { IModeler, ITlmLinkMap, ITlmNamespaceMap, ITlmTypeMap } from "../api";
import { loadCoreSchema, TlmLink, TlmNamespace, TlmType } from "../core";
import { LinkModel, LinkOptions } from "./link";
import { NamespaceModel } from "./namespace";
import { OidGenerator } from "./oid";
import { TypeModel } from "./type";

declare type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

export class Modeler implements IModeler {
  private readonly _oidGenerator: OidGenerator;
  private readonly _namespaceModel: NamespaceModel;
  private readonly _typeModel: TypeModel;
  private readonly _linkModel: LinkModel;
  private _initialized = false;

  // START-NO-SONAR
  private readonly _statementProcessors = [
    /\s*An?\s+(?<fromType>[a-z0-9_-]+)(?:\s*,\s*the\s+(?<fromName>[a-z0-9_-]+)\s*,)?\s+(?<rel>is\sidentified\sby|has\s+exactly\s+one|has\s+at\s+most\s+one|has\s+at\s+least\s+one|can\s+have\s+some)\s+(?<link>[a-z0-9_-]+)\s+(?:each\s+of\s+)?which\s+must\s+be\s+an?\s+(?<toType>[a-z0-9_-]+)\s*(?:,\s*the\s+(?<toName>[a-z0-9_-]+)\s*)?\.?\s*/i,
    async (st: RegExpMatchArray) => this.processLinkDefinitionStatement(st),
    /\s*An?\s+([a-z0-9_-]+)\s+(is\s+exactly\s+one|must\s+be\s+a)\s+([a-z0-9_-]+)\s+for\s+an?\s+([a-z0-9_-]+)\s*\.?\s*/i,
    async (st: RegExpMatchArray) =>
      this.processReverseLinkDefinitionStatement(st),
    /\s*An?\s+([a-z0-9_-]+)\s+has\s+toggle\s+([a-z0-9_-]+)\s*\.?\s*/i,
    async (st: RegExpMatchArray) => this.processToggleDefinitionStatement(st),
    /\s*An?\s+([a-z0-9_-]+)\s+is\s+a\s+kind\s+of\s+([a-z0-9_-]+)\s*\.?\s*/i,
    async (st: RegExpMatchArray) =>
      this.processSuperTypeDefinitionStatement(st),
    /\s*An?\s+([a-z0-9_-]+)\s+is\s+a\s+(?:"([^"]+)"|([^.])+)\s*\.?\s*/i,
    async (st: RegExpMatchArray) => this.processTypeDescriptionStatement(st),
    /\s*A\s+plural\s+of\s+([a-z0-9_-]+)\s+is\s+([a-z0-9_-]+)\s*\.?\s*/i,
    async (st: RegExpMatchArray) => this.processTypePluralNameStatement(st),
  ];
  // END-NO-SONAR

  constructor(
    oidGenerator: OidGenerator = new OidGenerator(),
    namespaceModel: NamespaceModel = new NamespaceModel(oidGenerator),
    typeModel: TypeModel = new TypeModel(oidGenerator, namespaceModel),
    linkModel: LinkModel = new LinkModel(
      oidGenerator,
      namespaceModel,
      typeModel
    )
  ) {
    this._oidGenerator = oidGenerator;
    this._namespaceModel = namespaceModel;
    this._typeModel = typeModel;
    this._linkModel = linkModel;
  }

  /// INTERFACE: IModeler

  public get namespaces(): ITlmNamespaceMap {
    return this._namespaceModel.namespaceMap;
  }

  public get types(): ITlmTypeMap {
    return this._typeModel.typeMap;
  }

  public get links(): ITlmLinkMap {
    return this._linkModel.linkMap;
  }

  public get activeNamespace(): string | undefined {
    if (this._namespaceModel.activeNamespace) {
      return this._namespaceModel.activeNamespacePrefix;
    } else {
      return undefined;
    }
  }

  public set activeNamespace(value: string | undefined) {
    if (value) {
      this._namespaceModel.activeNamespacePrefix = value;
    }
  }

  public async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    loadCoreSchema();

    await this._oidGenerator.initialize();
    await this._namespaceModel.initialize();
    await this._typeModel.initialize();
    await this._linkModel.initialize();
  }

  public async addNamespace(
    prefix: string,
    uri: string,
    description?: string
  ): Promise<TlmNamespace> {
    return this._namespaceModel.addNamespace(prefix, uri, description);
  }

  public async addStatement(statement: string): Promise<void> {
    for (let i = 0; i < this._statementProcessors.length; i++) {
      const regex = this._statementProcessors[i] as RegExp;
      const processor = this._statementProcessors[++i] as (
        st: RegExpMatchArray
      ) => Promise<void>;
      const match = statement.match(regex);
      if (match) {
        await processor(match);
        return;
      }
    }
    throw new Error(`Cannot process statement ${statement}`);
  }

  public getValueTypeForLink(link: TlmLink): TlmType {
    return this._typeModel.findTypeByOid(link.toType);
  }

  public getTypeByName(type: string): TlmType {
    let ns: string = this._namespaceModel.activeNamespace?.prefix || "tlm";
    let name: string = type;

    if (type.includes(":")) {
      [ns, name] = type.split(":", 2);
    }
    return this._typeModel.typeMap[ns][name];
  }

  private async processLinkDefinitionStatement(
    match: RegExpMatchArray
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const groups = match.groups!;
    const rel = groups.rel.replace(/\s+/g, " ").trim();
    const o: Mutable<LinkOptions> = {
      fromType: groups.fromType,
      fromName: groups.fromName,
      name: groups.link,
      toType: groups.toType,
      toName: groups.toName,
    };

    switch (rel) {
      case "is identified by":
        o.isPrimaryId = true;
        break;
      case "has exactly one":
        o.isSingular = true;
        o.isMandatory = true;
        break;
      case "has at most one":
        o.isSingular = true;
        break;
      case "has at least one":
        o.isMandatory = true;
        break;
      case "can have some":
        break;
      default:
        throw new Error(`Cannot process statement relationship '${rel}'`);
    }
    await this._linkModel.addLink(o);
  }

  private async processReverseLinkDefinitionStatement(
    match: RegExpMatchArray
  ): Promise<void> {
    const [, type, rel, link, otherType] = match;
    const processedRel = rel.replace(/\s+/g, " ").trim();
    switch (processedRel) {
      case "is exactly one":
        await this._linkModel.addReverseMandatoryLink(
          type,
          otherType,
          link,
          true
        );
        break;
      case "must be a":
        await this._linkModel.addReverseMandatoryLink(
          type,
          otherType,
          link,
          false
        );
        break;
      default:
        throw new Error(
          `Cannot process reverse statement relationship '${processedRel}'`
        );
    }
  }

  private async processToggleDefinitionStatement(
    match: RegExpMatchArray
  ): Promise<void> {
    const [, type, toggle] = match;
    await this._typeModel.addType(type);
    await this._linkModel.addToggleLink(type, toggle);
  }

  private async processSuperTypeDefinitionStatement(
    match: RegExpMatchArray
  ): Promise<void> {
    const [, type, superType] = match;
    const typeObj = await this._typeModel.addType(type);
    const superTypeObj = await this._typeModel.addType(superType);
    const newTypeObj = typeObj.update({ superType: superTypeObj.oid });
    await this._typeModel.replaceType(newTypeObj);
  }

  private async processTypeDescriptionStatement(
    match: RegExpMatchArray
  ): Promise<void> {
    const [, type, description] = match;
    const typeObj = await this._typeModel.addType(type);
    const newTypeObj = typeObj.update({ description });
    await this._typeModel.replaceType(newTypeObj);
  }

  // noinspection JSMethodCanBeStatic
  private async processTypePluralNameStatement(
    match: RegExpMatchArray
  ): Promise<void> {
    const [, type, plural] = match;
    const typeObj = await this._typeModel.addType(type);
    const newTypeObj = typeObj.update({ plural });
    await this._typeModel.replaceType(newTypeObj);
  }
}
