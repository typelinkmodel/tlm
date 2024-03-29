type OptionalExceptFor<T, TRequired extends keyof T = keyof T> = Partial<
  Pick<T, Exclude<keyof T, TRequired>>
> &
  Required<Pick<T, TRequired>>;

export class TlmObject {
  private readonly _oid: number;
  private readonly _type: number;

  constructor(oid: number, type: number) {
    this._oid = oid;
    this._type = type;
  }

  get oid(): number {
    return this._oid;
  }

  get type(): number {
    return this._type;
  }
}

export class TlmNamespace extends TlmObject {
  public static readonly NAMESPACE_TYPE = 3;

  private readonly _prefix: string;
  private readonly _uri: string;
  private readonly _description?: string;

  constructor(oid: number, prefix: string, uri: string, description?: string) {
    super(oid, TlmNamespace.NAMESPACE_TYPE);
    this._prefix = prefix;
    this._uri = uri;
    this._description = description;
  }

  get prefix(): string {
    return this._prefix;
  }

  get uri(): string {
    return this._uri;
  }

  get description(): string | undefined {
    return this._description;
  }
}

export class TlmType extends TlmObject {
  public static readonly TYPE_TYPE = 4;

  private readonly _namespace: number;
  private readonly _name: string;
  private readonly _superType: number;
  private readonly _description?: string;
  private readonly _plural?: string;

  constructor(o: OptionalExceptFor<TlmType, "oid" | "namespace" | "name">) {
    super(o.oid, TlmType.TYPE_TYPE);
    this._namespace = o.namespace;
    this._name = o.name;
    this._superType = o.superType || TlmType.TYPE_TYPE;
    this._description = o.description;
    this._plural = o.plural;
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

  get description(): string | undefined {
    return this._description;
  }

  get plural(): string | undefined {
    return this._plural;
  }

  public update(updates: Partial<TlmType>): TlmType {
    const original = {
      oid: this.oid,
      namespace: this.namespace,
      name: this.name,
      superType: this.superType,
      description: this.description,
      plural: this.plural,
    };
    const updated = { ...original, ...updates };
    return new TlmType(updated);
  }
}

type TlmLinkOptions = OptionalExceptFor<
  TlmLink,
  "oid" | "fromType" | "toType" | "name"
>;

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

  constructor(o: TlmLinkOptions) {
    super(o.oid, TlmLink.LINK_TYPE);
    TlmLink.checkPrimaryIdOptionIsValid(o);
    TlmLink.checkToggleOptionIsValid(o);
    this._fromType = o.fromType;
    this._toType = o.toType;
    this._name = o.name;
    this._fromName = o.fromName;
    this._toName = o.toName;
    this._isSingular = o.isSingular || o.isPrimaryId || o.isToggle || false;
    this._isMandatory = o.isMandatory || o.isPrimaryId || o.isToggle || false;
    this._isPrimaryId = o.isPrimaryId || false;
    this._isSingularTo = o.isSingularTo || false;
    this._isMandatoryTo = o.isMandatoryTo || false;
    this._isValue = o.isValue || o.isPrimaryId || o.isToggle || false;
    this._isToggle = o.isToggle || false;
    this._description = o.description;
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

  private static checkPrimaryIdOptionIsValid(o: TlmLinkOptions) {
    if (o.isPrimaryId === true) {
      if (o.isSingular === false) {
        throw new Error("Primary ID links must be singular");
      }
      if (o.isMandatory === false) {
        throw new Error("Primary ID links must be mandatory");
      }
      if (o.isValue === false) {
        throw new Error("Primary ID links must be to a value");
      }
    }
  }

  private static checkToggleOptionIsValid(o: TlmLinkOptions) {
    if (o.isToggle === true) {
      if (o.isSingular === false) {
        throw new Error("Toggle links must be singular");
      }
      if (o.isMandatory === false) {
        throw new Error("Toggle links must be mandatory");
      }
      if (o.isValue === false) {
        throw new Error("Toggle links must be to a value");
      }
    }
  }

  public update(updates: Partial<TlmLink>): TlmLink {
    const original = {
      oid: this.oid,
      type: this.type,
      fromType: this.fromType,
      toType: this.toType,
      name: this.name,
      fromName: this.fromName,
      toName: this.toName,
      isSingular: this.isSingular,
      isMandatory: this.isMandatory,
      isPrimaryId: this.isPrimaryId,
      isSingularTo: this.isSingularTo,
      isMandatoryTo: this.isMandatoryTo,
      isValue: this.isValue,
      isToggle: this.isToggle,
      description: this.description,
    };
    const updated = { ...original, ...updates };
    return new TlmLink(updated);
  }
}
