import { ILoader } from "../api";

function getExtension(filename: string): string {
  const re = /(?:\.(?<ext>[^.]+)?)?$/;
  return re.exec(filename)?.groups?.ext || "";
}

export class Loader implements ILoader {
  private readonly _loaders: ILoader[];

  constructor(loaders: ILoader[] = []) {
    this._loaders = loaders;
  }

  public async loadFile(filename: string): Promise<void> {
    const extension = getExtension(filename);
    for (const loader of this._loaders) {
      if (loader.supportsExtension(extension)) {
        return loader.loadFile(filename);
      }
    }
    throw new Error(`Cannot recognize file type of ${filename}`);
  }

  public supportsExtension(extension: string): boolean {
    for (const loader of this._loaders) {
      if (loader.supportsExtension(extension)) {
        return true;
      }
    }
    return false;
  }
}
