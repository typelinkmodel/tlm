/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-assignment */
import { TlmLink, TlmObject } from "./schema";

export class TlmFact {
  private readonly _subject: TlmObject;
  private readonly _link: TlmLink;
  private readonly _value: any;

  get subject(): TlmObject {
    return this._subject;
  }

  get link(): TlmLink {
    return this._link;
  }

  get value(): any {
    return this._value;
  }

  constructor(subject: TlmObject, link: TlmLink, value: any) {
    this._subject = subject;
    this._link = link;
    this._value = value;
  }
}
