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
        /An? ([A-Za-z0-9_-]+) has exactly one ([A-Za-z0-9_-]+) which must be an? ([A-Za-z0-9_-]+)\.?/i,
        (st: RegExpMatchArray) => this.processLinkDefinitionStatement(st),
        /An? ([A-Za-z0-9_-]+) is identified by ([A-Za-z0-9_-]+) which must be an? ([A-Za-z0-9_-]+)\.?/i,
        (st: RegExpMatchArray) => this.processIdentityDefinitionStatement(st),
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

    public get activeNamespace(): string {
        return this._namespaceModel.activeNamespacePrefix;
    }

    public set activeNamespace(value: string) {
        this._namespaceModel.activeNamespacePrefix = value;
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

    public addNamespace(prefix: string, uri: string, description?: string): TlmNamespace {
        return this._namespaceModel.addNamespace(prefix, uri, description);
    }

    public addStatement(statement: string): void {
        for (let i = 0; i < this._statementProcessors.length; i++) {
            const regex = this._statementProcessors[i] as RegExp;
            const processor = this._statementProcessors[++i] as (st: RegExpMatchArray) => void;
            const match = statement.match(regex);
            if (match) {
                processor(match);
                return;
            }
        }
        throw new Error(`Cannot process statement ${statement}`);
    }

    public getValueTypeForLink(link: TlmLink): TlmType {
        return this._typeModel.findTypeByOid(link.toType);
    }

    private processLinkDefinitionStatement(match: RegExpMatchArray): void {
        // noinspection JSUnusedLocalSymbols
        const [_, type, link, otherType] = match;
        this._linkModel.addLink(type, otherType, link);
    }

    private processIdentityDefinitionStatement(match: RegExpMatchArray): void {
        // noinspection JSUnusedLocalSymbols
        const [_, type, link, otherType] = match;
        this._linkModel.addLink(
            type,
            otherType,
            link,
            undefined,
            undefined,
            true,
        );
    }
}
