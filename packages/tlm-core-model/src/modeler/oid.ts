export class OidGenerator {
  private _nextOid = 1;
  private _initialized = false;

  // eslint-disable-next-line @typescript-eslint/require-await
  public async initialize(): Promise<void> {
    if (this._initialized) {
      return;
    }
    this._initialized = true;
    this._nextOid = 1001;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async nextOid(): Promise<number> {
    const result = this._nextOid;
    this._nextOid++;
    return result;
  }
}
