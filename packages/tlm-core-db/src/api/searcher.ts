import { TlmObject } from "@typelinkmodel/tlm-core-model";

export interface IQuery {
  object?: TlmObject;
  type?: string;
  link?: string;
  value?: string;
}

export interface ISearcher {
  getUnique(query: IQuery): Promise<TlmObject>;

  findUnique(query: IQuery): Promise<TlmObject | undefined>;
}
