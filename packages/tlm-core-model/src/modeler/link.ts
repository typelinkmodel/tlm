import {ITlmLinkMap} from "../api";
import {loadCoreSchema, TLM_CORE_LINKS, TlmLink, TlmType} from "../core";
import {NamespaceModel} from "./namespace";
import {OidGenerator} from "./oid";
import {TypeModel} from "./type";

export class LinkModel {
    private _links: TlmLink[] = [];
    private readonly _oidGenerator: OidGenerator;
    private readonly _namespaceModel: NamespaceModel;
    private readonly _typeModel: TypeModel;
    private _initialized = false;

    constructor(
        oidGenerator: OidGenerator = new OidGenerator(),
        namespaceModel: NamespaceModel = new NamespaceModel(oidGenerator),
        typeModel: TypeModel = new TypeModel(oidGenerator, namespaceModel),
    ) {
        this._oidGenerator = oidGenerator;
        this._namespaceModel = namespaceModel;
        this._typeModel = typeModel;
    }

    public get linkMap(): ITlmLinkMap {
        const result: ITlmLinkMap = {};
        for (const ns of this._namespaceModel.namespaces) {
            result[ns.prefix] = {};
        }
        for (const t of this._typeModel.types) {
            const ns = this._namespaceModel.findNamespaceByOid(t.namespace);
            result[ns.prefix][t.name] = {};
        }
        for (const link of this._links) {
            const fromTypeOid = link.fromType;
            const fromType = this._typeModel.findTypeByOid(fromTypeOid);
            const ns = this._namespaceModel.findNamespaceByOid(fromType.namespace);
            const linkName = link.name;
            result[ns.prefix][fromType.name][linkName] = link;
        }
        return result;
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

        this._links = TLM_CORE_LINKS.concat([]);
    }

    public findLinkByName(fromTypeOid: number, name: string): TlmLink {
        for (const l of this._links) {
            if (l.fromType === fromTypeOid && l.name === name) {
                return l;
            }
        }
        throw new Error(`No link named ${name} from type oid ${fromTypeOid}`);
    }

    public findLinkByNameOptional(fromType: number, name: string): TlmLink | undefined {
        try {
            return this.findLinkByName(fromType, name);
        } catch (e) {
            return undefined;
        }
    }

    public addLink(fromType: string, name: string, toType: string): TlmLink {
        const fromTypeObj: TlmType = this._typeModel.addType(fromType);
        const toTypeObj: TlmType = this._typeModel.addType(toType);

        const existingLink = this.findLinkByNameOptional(fromTypeObj.oid, name);
        if (existingLink) {
            return existingLink;
        }

        const newLink = new TlmLink(this._oidGenerator.nextOid(), fromTypeObj.oid, toTypeObj.oid, name);
        this._links.push(newLink);
        return newLink;
    }
}
