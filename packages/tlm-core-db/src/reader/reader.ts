import {TlmFact, TlmObject} from "@typelinkmodel/tlm-core-model";
import {IReader} from "../api";

export class Reader implements IReader {
    public async readFactUnique(subject: TlmObject, select: { links: string[] }): Promise<TlmFact> {
        throw new Error("Not implemented");
    }
}
