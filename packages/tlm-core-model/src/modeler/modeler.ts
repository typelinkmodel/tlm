import {IModeler, ITlmLinkMap, ITlmNamespaceMap, ITlmTypeMap} from "../api";
import {
    loadCoreSchema,
    TLM_CORE_LINKS,
    TLM_CORE_NAMESPACES,
    TLM_CORE_TYPES,
    TlmLink,
    TlmNamespace,
    TlmType,
} from "../core";

export class Modeler implements IModeler {

    private _types: TlmType[] = [];
    private _links: TlmLink[] = [];
    private _namespaces: TlmNamespace[] = [];
    private _activeNamespace?: TlmNamespace;
    private _nextOid = 1;
    private _initialized = false;
    private _tlmNamespace: TlmNamespace | undefined = undefined;
    private _xsNamespace: TlmNamespace | undefined = undefined;

    private readonly _statementProcessors = [
        /An? ([A-Za-z0-9_-]+) has exactly one ([A-Za-z0-9_-]+) which must be a ([A-Za-z0-9_-]+)\.?/i,
        (st: RegExpMatchArray) => this.processLinkDefinitionStatement(st),
    ];

    /// INTERFACE: IModeler

    public get namespaces(): ITlmNamespaceMap {
        const result: ITlmNamespaceMap = {};
        for (const ns of this._namespaces) {
            result[ns.prefix] = ns;
        }
        return result;
    }

    public get types(): ITlmTypeMap {
        const result: ITlmTypeMap = {};
        for (const ns of this._namespaces) {
            result[ns.prefix] = {};
        }
        for (const t of this._types) {
            const ns = this.findNamespaceByOid(t.namespace);
            result[ns.prefix][t.name] = t;
        }
        return result;
    }

    public get links(): ITlmLinkMap {
        const result: ITlmLinkMap = {};
        for (const ns of this._namespaces) {
            result[ns.prefix] = {};
        }
        for (const t of this._types) {
            const ns = this.findNamespaceByOid(t.namespace);
            result[ns.prefix][t.name] = {};
        }
        for (const link of this._links) {
            const fromTypeOid = link.fromType;
            const fromType = this.findTypeByOid(fromTypeOid);
            const ns = this.findNamespaceByOid(fromType.namespace);
            const linkName = link.name;
            result[ns.prefix][fromType.name][linkName] = link;
        }
        return result;
    }

    public get activeNamespace(): string {
        if (this._activeNamespace === undefined) {
            throw new Error("Active namespace not set");
        }
        return this._activeNamespace.prefix;
    }

    public set activeNamespace(value: string) {
        if (value === undefined || value === null) {
            throw new Error(`Cannot deactivate namespace`);
        }
        if (value === "tlm" || value === "xs") {
            throw new Error(`You should not modify the built-in namespace ${value}`);
        }
        this._activeNamespace = this.findNamespaceByPrefix(value);
    }

    public initialize(): void {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
        loadCoreSchema();

        this._types = TLM_CORE_TYPES.concat([]);
        this._namespaces = TLM_CORE_NAMESPACES.concat([]);
        this._links = TLM_CORE_LINKS.concat([]);
        this._tlmNamespace = this.namespaces.tlm;
        this._xsNamespace = this.namespaces.xs;

        this.initializeNextOid();
    }

    public addNamespace(prefix: string, uri: string, description?: string): TlmNamespace {
        for (const existingNamespace of this._namespaces) {
            if (existingNamespace.prefix === prefix) {
                if (existingNamespace.uri === uri) {
                    return existingNamespace;
                } else {
                    throw new Error(
                        `Namespace with prefix ${prefix} already exists with URI ${existingNamespace.uri}, cannot change to URI ${uri}`,
                    );
                }
            } else if (existingNamespace.uri === uri) {
                throw new Error(
                    `Namespace with uri ${uri} already exists with prefix ${existingNamespace.prefix}, cannot change to prefix ${prefix}`,
                );
            }
        }
        const newNamespace = new TlmNamespace(this.nextOid(), prefix, uri, description);
        this._namespaces.push(newNamespace);
        return newNamespace;
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
        return this.findTypeByOid(link.toType);
    }

    /// FIND

    private findTypeByOid(oid: number): TlmType {
        for (const t of this._types) {
            if (t.oid === oid) {
                return t;
            }
        }
        throw new Error(`No type with oid ${oid}`);
    }

    private findTypeByName(name: string): TlmType {
        if (this._activeNamespace) {
            for (const t of this._types) {
                if (t.name === name && this._activeNamespace.oid === t.namespace) {
                    return t;
                }
            }
        }
        this.initialize();
        for (const t of this._types) {
            if (
                t.name === name
                && (
                    t.namespace === this._tlmNamespace!.oid
                    || t.namespace === this._xsNamespace!.oid
                )
            ) {
                return t;
            }
        }

        // not found, but be nice about the error if we can
        for (const t of this._types) {
            if (t.name === name) {
                const ns = this.findNamespaceByOid(t.namespace);
                throw new Error(`Found a type ${ns.prefix}:${name}, but ${ns.prefix} is not active`);
            }
        }

        throw new Error(`No type with name ${name}`);
    }

    private findTypeByNameOptional(name: string): TlmType | undefined {
        try {
            return this.findTypeByName(name);
        } catch (e) {
            return undefined;
        }
    }

    private findNamespaceByOid(oid: number): TlmNamespace {
        for (const n of this._namespaces) {
            if (n.oid === oid) {
                return n;
            }
        }
        throw new Error(`No namespace with oid ${oid}`);
    }

    private findNamespaceByPrefix(prefix: string): TlmNamespace {
        for (const n of this._namespaces) {
            if (n.prefix === prefix) {
                return n;
            }
        }
        throw new Error(`No Namespace with prefix ${prefix}`);
    }

    private findLinkByName(fromTypeOid: number, name: string): TlmLink {
        for (const l of this._links) {
            if (l.fromType === fromTypeOid && l.name === name) {
                return l;
            }
        }
        throw new Error(`No link named ${name} from type oid ${fromTypeOid}`);
    }

    private findLinkByNameOptional(fromType: number, name: string): TlmLink | undefined {
        try {
            return this.findLinkByName(fromType, name);
        } catch (e) {
            return undefined;
        }
    }

    /// ADD

    private processLinkDefinitionStatement(match: RegExpMatchArray): void {
        const [_, type, link, otherType] = match;
        this.addLink(type, link, otherType);
    }

    private addLink(fromType: string, name: string, toType: string): TlmLink {
        const fromTypeObj: TlmType = this.addType(fromType);
        const toTypeObj: TlmType = this.addType(toType);

        const existingLink = this.findLinkByNameOptional(fromTypeObj.oid, name);
        if (existingLink) {
            return existingLink;
        }

        const newLink = new TlmLink(this.nextOid(), fromTypeObj.oid, toTypeObj.oid, name);
        this._links.push(newLink);
        return newLink;
    }

    private addType(name: string): TlmType {
        const existingType = this.findTypeByNameOptional(name);
        if (existingType) {
            return existingType;
        }

        const newType = new TlmType(this.nextOid(), this.getActiveNamespaceOid(), name);
        this._types.push(newType);
        return newType;
    }

    /// Utility

    private getActiveNamespaceOid(): number {
        if (!this._activeNamespace) {
            throw new Error("Active namespace not set");
        }
        return this._activeNamespace.oid;
    }

    private initializeNextOid() {
        this._nextOid = 1001;
    }

    private nextOid(): number {
        const result = this._nextOid;
        this._nextOid++;
        return result;
    }
}
