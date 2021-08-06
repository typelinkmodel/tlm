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
    description?: string
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
  private readonly _isSingular: boolean;
  private readonly _isMandatory: boolean;
  private readonly _isPrimaryId: boolean;
  private readonly _isSingularTo: boolean;
  private readonly _isMandatoryTo: boolean;
  private readonly _isValue: boolean;
  private readonly _isToggle: boolean;
  private readonly _description?: string;

  constructor(
    oid: number,
    fromType: number,
    toType: number,
    name: string,
    fromName?: string,
    toName?: string,
    isSingular = false,
    isMandatory = false,
    isPrimaryId = false,
    isSingularTo = false,
    isMandatoryTo = false,
    isValue = false,
    isToggle = false,
    description: string | undefined = undefined
  ) {
    super(oid, TlmLink.LINK_TYPE);
    if (isPrimaryId) {
      if (!isSingular) {
        throw new Error("Primary ID links must be singular");
      }
      if (!isMandatory) {
        throw new Error("Primary ID links must be mandatory");
      }
    }
    if (isToggle) {
      if (!isSingular) {
        throw new Error("Toggle links must be singular");
      }
      if (!isMandatory) {
        throw new Error("Toggle links must be mandatory");
      }
      if (!isValue) {
        throw new Error("Toggle links must be to a value");
      }
    }
    this._fromType = fromType;
    this._toType = toType;
    this._name = name;
    this._fromName = fromName;
    this._toName = toName;
    this._isSingular = isSingular;
    this._isMandatory = isMandatory;
    this._isPrimaryId = isPrimaryId;
    this._isSingularTo = isSingularTo;
    this._isMandatoryTo = isMandatoryTo;
    this._isValue = isValue;
    this._isToggle = isToggle;
    this._description = description;
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

  get isSingular(): boolean {
    return this._isSingular;
  }

  get isMandatory(): boolean {
    return this._isMandatory;
  }

  get isPrimaryId(): boolean {
    return this._isPrimaryId;
  }

  get isSingularTo(): boolean {
    return this._isSingularTo;
  }

  get isMandatoryTo(): boolean {
    return this._isMandatoryTo;
  }

  get isValue(): boolean {
    return this._isValue;
  }

  get isToggle(): boolean {
    return this._isToggle;
  }

  get description(): string | undefined {
    return this._description;
  }
}
