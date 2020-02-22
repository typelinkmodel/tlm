import {IModeler, ITlmLinkMap, ITlmNamespaceMap, ITlmTypeMap} from "../api";
import {
    loadCoreSchema,
    TlmLink,
    TlmNamespace,
    TlmType,
} from "../core";
import {LinkModel} from "./link";
import {NamespaceModel} from "./namespace";
import {OidGenerator} from "./oid";
import {TypeModel} from "./type";

export class Modeler implements IModeler {
    private readonly _oidGenerator: OidGenerator;
    private readonly _namespaceModel: NamespaceModel;
    private readonly _typeModel: TypeModel;
    private readonly _linkModel: LinkModel;
    private _initialized = false;

    private readonly _statementProcessors = [
        /\s*An?\s+(?<fromType>[A-Za-z0-9_-]+)(?:\s*,\s*the\s+(?<fromName>[A-Za-z0-9_-]+)\s*,)?\s+(?<rel>is\sidentified\sby|has\s+exactly\s+one|has\s+at\s+most\s+one|has\s+at\s+least\s+one|can\s+have\s+some)\s+(?<link>[A-Za-z0-9_-]+)\s+(?:each\s+of\s+)?which\s+must\s+be\s+an?\s+(?<otherType>[A-Za-z0-9_-]+)\s*(?:,\s*the\s+(?<otherName>[A-Za-z0-9_-]+)\s*,\s*)?\.?\s*/i,
        async (st: RegExpMatchArray) => await this.processLinkDefinitionStatement(st),
        /\s*An?\s+([A-Za-z0-9_-]+)\s+(is\s+exactly\s+one|must\s+be\s+a)\s+([A-Za-z0-9_-]+)\s+for\s+an?\s+([A-Za-z0-9_-]+)\s*\.?\s*/i,
        async (st: RegExpMatchArray) => await this.processReverseLinkDefinitionStatement(st),
        /\s*An?\s+([A-Za-z0-9_-]+)\s+(has\s+toggle)\s+([A-Za-z0-9_-]+)\s*\.?\s*/i,
        async (st: RegExpMatchArray) => await this.processToggleDefinitionStatement(st),
        /\s*An?\s+([A-Za-z0-9_-]+)\s+is\s+a\s+kind\s+of\s+([A-Za-z0-9_-]+)\s*\.?\s*/i,
        async (st: RegExpMatchArray) => await this.processSuperTypeDefinitionStatement(st),
        /\s*An?\s+([A-Za-z0-9_-]+)\s+is\s+a\s+(?:"([^"]+)"|([^.])+)\s*\.?\s*/i,
        async (st: RegExpMatchArray) => await this.processTypeDescriptionStatement(st),
        /\s*The\s+plural\s+of\s+([A-Za-z0-9_-]+)\s+is\s+([A-Za-z0-9_-]+)\s*\.?\s*/i,
        async (st: RegExpMatchArray) => await this.processTypePluralNameStatement(st),
    ];

    constructor(
        oidGenerator: OidGenerator = new OidGenerator(),
        namespaceModel: NamespaceModel = new NamespaceModel(oidGenerator),
        typeModel: TypeModel = new TypeModel(oidGenerator, namespaceModel),
        linkModel: LinkModel = new LinkModel(oidGenerator, namespaceModel, typeModel),
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

    public initialize(): void {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
        loadCoreSchema();

        this._oidGenerator.initialize();
        this._namespaceModel.initialize();
        this._typeModel.initialize();
        this._linkModel.initialize();
    }

    public async addNamespace(prefix: string, uri: string, description?: string): Promise<TlmNamespace> {
        return await this._namespaceModel.addNamespace(prefix, uri, description);
    }

    public async addStatement(statement: string): Promise<void> {
        for (let i = 0; i < this._statementProcessors.length; i++) {
            const regex = this._statementProcessors[i] as RegExp;
            const processor = this._statementProcessors[++i] as (st: RegExpMatchArray) => Promise<void>;
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

    private async processLinkDefinitionStatement(match: RegExpMatchArray): Promise<void> {
        if (!match.groups) {
            throw new Error("No matching groups!");
        }
        const fromType = match.groups.fromType;
        const fromName = match.groups.fromName;
        const rel = match.groups.rel;
        const link = match.groups.link;
        const otherType = match.groups.otherType;
        const otherName = match.groups.otherName;

        const processedRel = rel.replace(/\s+/g, " ").trim();
        switch (processedRel) {
            case "is identified by":
                await this._linkModel.addLink(
                    fromType,
                    otherType,
                    link,
                    fromName,
                    otherName,
                    true,
                    true,
                    true,
                );
                break;
            case "has exactly one":
                await this._linkModel.addLink(
                    fromType,
                    otherType,
                    link,
                    fromName,
                    otherName,
                    true,
                    true,
                    false,
                );
                break;
            case "has at most one":
                await this._linkModel.addLink(
                    fromType,
                    otherType,
                    link,
                    fromName,
                    otherName,
                    true,
                    false,
                    false,
                );
                break;
            case "has at least one":
                await this._linkModel.addLink(
                    fromType,
                    otherType,
                    link,
                    fromName,
                    otherName,
                    false,
                    true,
                    false,
                );
                break;
            case "can have some":
                await this._linkModel.addLink(
                    fromType,
                    otherType,
                    link,
                    fromName,
                    otherName,
                    false,
                    false,
                    false,
                );
                break;
            default:
                throw new Error(`Cannot process statement relationship '${processedRel}'`);
        }
    }

    private async processReverseLinkDefinitionStatement(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, type, rel, link, otherType] = match;
        const processedRel = rel.replace(/\s+/g, " ").trim();
        switch (processedRel) {
            case "is exactly one":
                await this._linkModel.addReverseMandatoryLink(
                    type,
                    otherType,
                    link,
                    true,
                );
                break;
            case "must be a":
                await this._linkModel.addReverseMandatoryLink(
                    type,
                    otherType,
                    link,
                    false,
                );
                break;
            default:
                throw new Error(`Cannot process reverse statement relationship '${processedRel}'`);
        }
    }

    private async processToggleDefinitionStatement(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, type, toggle] = match;
        const typeObj = await this._typeModel.addType(type);
        await this._linkModel.addToggleLink(type, toggle);
    }

    private async processSuperTypeDefinitionStatement(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, type, superType] = match;
        const typeObj = await this._typeModel.addType(type);
        const superTypeObj = await this._typeModel.addType(superType);
        const newTypeObj = new TlmType(typeObj.oid, typeObj.namespace, typeObj.name, superTypeObj.oid,
            typeObj.description);
        await this._typeModel.replaceType(newTypeObj);
    }

    private async processTypeDescriptionStatement(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, type, description] = match;
        const typeObj = await this._typeModel.addType(type);
        const newTypeObj = new TlmType(typeObj.oid, typeObj.namespace, typeObj.name, typeObj.oid, description);
        await this._typeModel.replaceType(newTypeObj);
    }

    // noinspection JSMethodCanBeStatic
    private async processTypePluralNameStatement(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, type, plural] = match;
        console.log(`TODO: Add that the plural of ${type} is ${plural}`);
    }
}
