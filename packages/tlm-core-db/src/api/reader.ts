import { TlmFact, TlmObject } from "@typelinkmodel/tlm-core-model";

export interface IReader {
  readFactUnique(
    subject: TlmObject,
    select: { links: string[] },
  ): Promise<TlmFact>;
}
