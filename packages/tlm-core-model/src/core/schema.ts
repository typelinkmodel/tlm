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

export class TlmNamespace extends TlmObject {
    public static readonly NAMESPACE_TYPE = 3;

    private readonly _prefix: string;
    private readonly _uri: string;
    private readonly _description?: string;

    get prefix(): string {
        return this._prefix;
    }

    get uri(): string {
        return this._uri;
    }

    get description(): string | undefined {
        return this._description;
    }

    constructor(oid: number, prefix: string, uri: string, description?: string) {
        super(oid, TlmNamespace.NAMESPACE_TYPE);
        this._prefix = prefix;
        this._uri = uri;
        this._description = description;
    }
}

export class TlmType extends TlmObject {
    public static readonly TYPE_TYPE = 4;

    private readonly _namespace: number;
    private readonly _name: string;
    private readonly _superType: number;
    private readonly _description?: string;

    get namespace(): number {
        return this._namespace;
    }

    get name(): string {
        return this._name;
    }

    get superType(): number {
        return this._superType;
    }

    get description(): string | undefined {
        return this._description;
    }

    constructor(
        oid: number,
        namespace: number,
        name: string,
        superType: number = TlmType.TYPE_TYPE,
        description?: string,
    ) {
        super(oid, TlmType.TYPE_TYPE);
        this._namespace = namespace;
        this._name = name;
        this._superType = superType;
        this._description = description;
    }
}

export class TlmLink extends TlmObject {
    public static readonly LINK_TYPE = 53;

    private readonly _fromType: number;
    private readonly _toType: number;
    private readonly _name: string;
    private readonly _fromName?: string;
    private readonly _toName?: string;

    constructor(oid: number, fromType: number, toType: number, name: string, fromName?: string, toName?: string) {
        super(oid, TlmLink.LINK_TYPE);
        this._fromType = fromType;
        this._toType = toType;
        this._name = name;
        this._fromName = fromName;
        this._toName = toName;
    }

    get fromType(): number {
        return this._fromType;
    }

    get toType(): number {
        return this._toType;
    }

    get name(): string {
        return this._name;
    }

    get fromName(): string | undefined {
        return this._fromName;
    }

    get toName(): string | undefined {
        return this._toName;
    }
}
