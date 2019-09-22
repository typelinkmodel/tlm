export class TlmObject {
    private readonly _oid: number;
    private readonly _type: number;

    get oid(): number {
        return this._oid;
    }

    get type(): number {
        return this._type;
    }

    constructor(oid: number, type: number) {
        this._oid = oid;
        this._type = type;
    }
}

export class TlmNamespace {
    private readonly _oid: number;
    private readonly _prefix: string;
    private readonly _uri: string;
    private readonly _description: string;

    get oid(): number {
        return this._oid;
    }

    get prefix(): string {
        return this._prefix;
    }

    get uri(): string {
        return this._uri;
    }

    get description(): string {
        return this._description;
    }

    constructor(oid: number, prefix: string, uri: string, description: string) {
        this._oid = oid;
        this._prefix = prefix;
        this._uri = uri;
        this._description = description;
    }
}

export class TlmType {
    private readonly _oid: number;
    private readonly _namespace: number;
    private readonly _name: string;
    private readonly _superType: number;
    private readonly _description: string;

    get oid(): number {
        return this._oid;
    }

    get namespace(): number {
        return this._namespace;
    }

    get name(): string {
        return this._name;
    }

    get superType(): number {
        return this._superType;
    }

    get description(): string {
        return this._description;
    }

    constructor(oid: number, namespace: number, name: string, superType: number, description: string) {
        this._oid = oid;
        this._namespace = namespace;
        this._name = name;
        this._superType = superType;
        this._description = description;
    }
}
