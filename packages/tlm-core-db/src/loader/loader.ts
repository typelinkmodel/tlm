import {ILoader} from "../api";

export class Loader implements ILoader {
    public async loadFile(filename: string): Promise<void> {
        throw new Error("Not implemented");
    }
}
