
export class OidGenerator {
    private _nextOid = 1;
    private _initialized = false;

    public initialize(): void {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
        this._nextOid = 1001;
    }

    public nextOid(): number {
        const result = this._nextOid;
        this._nextOid++;
        return result;
    }
}
