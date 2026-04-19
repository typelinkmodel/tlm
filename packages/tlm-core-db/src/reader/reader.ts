import type { TlmFact } from "@typelinkmodel/tlm-core-model";
import type { IReader } from "../api";

export class Reader implements IReader {
  // eslint-disable-next-line @typescript-eslint/require-await
  public async readFactUnique(): Promise<TlmFact> {
    throw new Error("Not implemented");
  }
}
