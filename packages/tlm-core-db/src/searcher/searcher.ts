import {TlmObject} from "@typelinkmodel/tlm-core-model";
import {IQuery, ISearcher} from "../api";

export class Searcher implements ISearcher {
    public async getUnique(query: IQuery): Promise<TlmObject> {
        throw new Error("Not implemented");
    }

    public async findUnique(query: IQuery): Promise<TlmObject|undefined> {
        throw new Error("Not implemented");
    }
}
