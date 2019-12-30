import {TlmObject} from "@typelinkmodel/tlm-core-model";

export interface IQuery {
    object?: TlmObject;
    type?: string;
    link?: string;
    value?: string;
}

export interface ISearcher {
    findUnique(query: IQuery): Promise<TlmObject>;
}
