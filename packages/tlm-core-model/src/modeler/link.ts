import {ITlmLinkMap} from "../api";
import {loadCoreSchema, TLM_CORE_LINKS, TlmLink, TlmType} from "../core";
import {NamespaceModel} from "./namespace";
import {OidGenerator} from "./oid";
import {TypeModel} from "./type";

export class LinkModel {
    private _links: TlmLink[] = [];
    private _linkMapCache?: ITlmLinkMap = undefined;
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
        if (this._linkMapCache !== undefined) {
            return this._linkMapCache;
        }
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
        this._linkMapCache = result;
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

    public async addLink(
        fromType: string,
        toType: string,
        name: string,
        fromName?: string,
        toName?: string,
        isSingular: boolean = false,
        isMandatory: boolean = false,
        isPrimaryId: boolean = false,
    ): Promise<TlmLink> {
        const fromTypeObj: TlmType = await this._typeModel.addType(fromType);
        const toTypeObj: TlmType = await this._typeModel.addType(toType);

        const existingLink = this.findLinkByNameOptional(fromTypeObj.oid, name);
        if (existingLink) {
            return existingLink;
        }

        const newLink = new TlmLink(
            await this._oidGenerator.nextOid(),
            fromTypeObj.oid,
            toTypeObj.oid,
            name,
            fromName,
            toName,
            isSingular,
            isMandatory,
            isPrimaryId);
        this._links.push(newLink);
        this._linkMapCache = undefined;
        return newLink;
    }

    public async addReverseMandatoryLink(
        toType: string,
        fromType: string,
        name: string,
        isSingularTo: boolean = false,
    ): Promise<TlmLink> {
        const toTypeObj = this._typeModel.findTypeByName(toType);
        const fromTypeObj = this._typeModel.findTypeByName(fromType);

        const existingLink = this.findLinkByName(fromTypeObj.oid, name);
        if (toTypeObj.oid !== existingLink.toType) {
            throw new Error(`Existing relationship '${name}' from '${fromType}' goes to '${toTypeObj.name}', not '${toType}'`);
        }

        const newLink = new TlmLink(
            existingLink.oid,
            existingLink.fromType,
            existingLink.toType,
            existingLink.name,
            existingLink.fromName,
            existingLink.toName,
            existingLink.isSingular,
            existingLink.isMandatory,
            existingLink.isPrimaryId,
            isSingularTo,
            true);
        const i = this._links.indexOf(existingLink);
        this._links.splice(i, 1, newLink);
        this._linkMapCache = undefined;
        return newLink;
    }
}
