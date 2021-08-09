import { IModeler, Modeler } from "@typelinkmodel/tlm-core-model";
import { createReadStream, ReadStream } from "fs";
import { createInterface } from "readline";
import { ILoader, IReader, ISearcher } from "../api";
import { Reader } from "../reader";
import { Searcher } from "../searcher";

enum STATE {
  INITIAL,
  MAIN,
  EXAMPLE_START,
  EXAMPLE_HEADER,
  EXAMPLE_DIVIDER,
  EXAMPLE,
  DATA,
  DATA_MULTI_FACT,
}

enum TLMD_TYPE {
  MODEL,
  DATA,
  MESSAGE,
  UNKNOWN,
}

export class TlmdLoader implements ILoader {
  private readonly _modeler: IModeler;
  private readonly _reader: IReader;
  private readonly _searcher: ISearcher;

  constructor(
    modeler: IModeler = new Modeler(),
    reader: IReader = new Reader(),
    searcher: ISearcher = new Searcher()
  ) {
    this._modeler = modeler;
    this._reader = reader;
    this._searcher = searcher;
  }

  public async loadFile(filename: string): Promise<void> {
    const handler = new TlmdStreamHandler(this._modeler);
    const loader = new TlmdFileLoader(filename, handler);
    await loader.loadFile();
  }

  supportsExtension(extension: string): boolean {
    return extension === "tlmd";
  }
}

export class TlmdStreamHandler {
  private readonly _modeler: IModeler;
  private readonly _continueOnError: boolean;
  private readonly _debug: boolean;

  constructor(modeler: IModeler, continueOnError = false, debug = false) {
    this._modeler = modeler;
    this._continueOnError = continueOnError;
    this._debug = debug;
  }

  public debug(message: string): void {
    if (this._debug) {
      console.debug(message);
    }
  }

  public async handleNextLine(lineno: number, line: string): Promise<void> {
    this.debug(`${String(lineno).padStart(4)}: ${line}`);
  }

  public handleError(filename: string, lineno: number, error: string): void {
    const message = `Error parsing ${filename} on line ${lineno}: ${error}`;
    if (this._continueOnError) {
      console.error(message);
    } else {
      throw new Error(message);
    }
  }

  public async handleStart(
    type: TLMD_TYPE,
    title: string | undefined
  ): Promise<void> {
    this.debug(`TLMD Document type = '${type}', title = '${title}'`);
  }

  public async handleNamespace(prefix: string, uri: string): Promise<void> {
    this.debug(`Namespace prefix = '${prefix}', uri = '${uri}'`);
    await this._modeler.addNamespace(prefix, uri);
    if (!this._modeler.activeNamespace) {
      this._modeler.activeNamespace = prefix;
    }
  }

  public async handleComment(comment: string): Promise<void> {
    this.debug(`Comment: ${comment}`);
  }

  public async handleSection(section: string): Promise<void> {
    this.debug(`Section: ${section}`);
  }

  public async handleStatement(statement: string): Promise<void> {
    this.debug(`Statement: ${statement}`);
    await this._modeler.addStatement(statement);
  }

  public async handleStartExample(
    firstColumnIsValidity: boolean,
    fromLinkPath: string,
    toLinkPath: string
  ): Promise<void> {
    this.debug(
      `Start example: has invalid examples? ${firstColumnIsValidity},` +
        ` from = '${fromLinkPath}', 'to = ${toLinkPath}'`
    );
  }

  public async handleExample(
    valid: boolean,
    fromLinkPath: string | undefined,
    toLinkPath: string | undefined
  ): Promise<void> {
    this.debug(
      `Example: ok? ${valid}, from = '${fromLinkPath}', to = '${toLinkPath}'`
    );
  }

  public async handleObject(type: string, id: string): Promise<void> {
    this.debug(`Object: type = '${type}', id = '${id}'`);
  }

  public async handleFact(link: string, value: string): Promise<void> {
    this.debug(`- fact: link = '${link}', value = '${value}'`);
  }

  public async handleToggle(link: string): Promise<void> {
    this.debug(`- toggle fact: link = '${link}'`);
  }

  public async handleMultiFactStart(link: string): Promise<void> {
    this.debug(`- multi fact: link = '${link}'`);
  }

  public async handleMultiFact(value: string): Promise<void> {
    this.debug(`  - multi fact value: value = '${value}'`);
  }
}

export class TlmdFileLoader {
  private readonly _handler: TlmdStreamHandler;
  private readonly _filename: string;

  private state: STATE = STATE.INITIAL;
  private lineno = 0;
  private line = "";
  private exampleFirstColumnIsValidity = false;

  private readonly _lineProcessors = [
    /Namespace\s+([^:]+):\s*(.*)/i,
    async (st: RegExpMatchArray) => this.processNamespaceLine(st),
    /\/\/\s*(.*)/i,
    async (st: RegExpMatchArray) => this.processCommentLine(st),
    /---\s*(.*)/i,
    async (st: RegExpMatchArray) => this.processSectionLine(st),
    /^(An?\s+.*\.)$/i,
    async (st: RegExpMatchArray) => this.processStatement(st),
  ];

  constructor(filename: string, handler: TlmdStreamHandler) {
    this._handler = handler;
    this._filename = filename;
  }

  public async loadFile(): Promise<void> {
    const stream = createReadStream(this._filename);
    try {
      await this.loadStream(stream);
    } finally {
      stream.close();
    }
  }

  public async loadStream(stream: ReadStream): Promise<void> {
    const reader = createInterface(stream);

    for await (const l of reader) {
      this.lineno++;
      this.line = l;
      await this.processLine();
    }
  }

  private err(error: Error | string): void {
    this._handler.handleError(this._filename, this.lineno, error.toString());
    this.state = STATE.MAIN;
  }

  private async processLine(): Promise<void> {
    await this._handler.handleNextLine(this.lineno, this.line);

    if (this.line.match(/^\s*$/i)) {
      // empty line resets to main
      this.state = STATE.MAIN;
      return;
    }

    let match;
    switch (this.state) {
      case STATE.INITIAL:
        this.state = STATE.MAIN;
        await this.processStartLine();
        break;
      case STATE.MAIN:
        if (this.line.match(/^\s+Examples:\s*$/i)) {
          this.state = STATE.EXAMPLE_START;
        } else if (this.line.match(/^The\s/i)) {
          this.state = STATE.DATA;
          await this.processObjectLine();
        } else {
          await this.processBodyLine();
        }
        break;
      case STATE.EXAMPLE_START:
        match = this.line.match(
          /^\s+(ok\s*\|\s*)?([A-Z0-9_/-]+)\s*\|\s*([A-Z0-9_/-]+)\s*$/i
        );
        if (!match) {
          this.err("expected example header!");
        } else {
          await this.processStartExample(match);
          this.state = STATE.EXAMPLE_HEADER;
        }
        break;
      case STATE.EXAMPLE_HEADER:
        match = this.line.match(/^\s+[=|-]+\s*$/i);
        if (!match) {
          // assume no divider and instead look for example
          this.state = STATE.EXAMPLE;
          await this.processExampleLine();
        } else {
          this.state = STATE.EXAMPLE_DIVIDER;
        }
        break;
      case STATE.EXAMPLE_DIVIDER:
        await this.processExampleLine();
        this.state = STATE.EXAMPLE;
        break;
      case STATE.EXAMPLE:
        if (this.line.match(/^\s+/i)) {
          // did not match first regex so line contains some non-whitespace
          await this.processExampleLine();
          // if the handler is swallowing errors, still assume examples continue next line
          this.state = STATE.EXAMPLE;
        } else {
          this.state = STATE.MAIN;
          await this.processBodyLine();
        }
        break;
      case STATE.DATA:
        if (this.line.match(/^The\s/i)) {
          await this.processObjectLine();
          // if the handler is swallowing errors, still assume data continues next line
          this.state = STATE.DATA;
        } else if (this.line.match(/^\s+has\s+[a-z0-9_-]+\s*:\s*$/i)) {
          this.state = STATE.DATA_MULTI_FACT;
          await this.processMultiFactStart();
          // if the handler is swallowing errors, still assume data continues next line
          this.state = STATE.DATA_MULTI_FACT;
        } else if (this.line.match(/^\s+has\s+[a-z0-9_-]+\s*:\s*[^\s].*$/i)) {
          await this.processFactLine();
          // if the handler is swallowing errors, still assume data continues next line
          this.state = STATE.DATA;
        } else if (this.line.match(/^\s+[a-z0-9_-]+\s*$/i)) {
          await this.processToggleFactLine();
          // if the handler is swallowing errors, still assume data continues next line
          this.state = STATE.DATA;
        } else {
          this.state = STATE.MAIN;
          await this.processBodyLine();
        }
        break;
      case STATE.DATA_MULTI_FACT:
        match = this.line.match(/^\s+(.*)$/i);
        if (match) {
          await this.processMultiFact();
          // if the handler is swallowing errors, still assume data continues next line
          this.state = STATE.DATA_MULTI_FACT;
        } else if (this.line.match(/^The\s/i)) {
          this.state = STATE.DATA;
          await this.processObjectLine();
        } else {
          this.state = STATE.MAIN;
          await this.processBodyLine();
        }
        break;
      default:
        this.err(`unknown parser state ${this.state}!`);
    }
  }

  private async processStartLine(): Promise<void> {
    if (!this.line.startsWith("# TLM")) {
      this.err("expected a '# TLM' start line!");
      return;
    }
    const match = this.line.match(/# TLM\s+([A-Z]+)\s*(?::(.*))?/i);
    if (!match) {
      this.err("missing TLMD type!");
      return;
    }
    const [, tlmdTypeString, titleString] = match;

    let tlmdType;
    if (tlmdTypeString.match(/^Model$/i)) {
      tlmdType = TLMD_TYPE.MODEL;
    } else if (tlmdTypeString.match(/^Data$/i)) {
      tlmdType = TLMD_TYPE.DATA;
    } else if (tlmdTypeString.match(/^Message$/i)) {
      tlmdType = TLMD_TYPE.MESSAGE;
    } else {
      this.err(`unrecognized TLMD type '${tlmdTypeString}'!`);
      tlmdType = TLMD_TYPE.UNKNOWN;
    }
    const tlmdTitle = trim(titleString);

    try {
      await this._handler.handleStart(tlmdType, tlmdTitle);
    } catch (e) {
      this.err(e);
    }
  }

  private async processBodyLine(): Promise<void> {
    for (let i = 0; i < this._lineProcessors.length; i++) {
      const regex = this._lineProcessors[i] as RegExp;
      const processor = this._lineProcessors[++i] as (
        st: RegExpMatchArray
      ) => Promise<void>;
      const match = this.line.match(regex);
      if (match) {
        await processor(match);
        return;
      }
    }
    this.err(`no way to process this line!`);
  }

  private async processExampleLine(): Promise<void> {
    if (this.exampleFirstColumnIsValidity) {
      const match = this.line.match(
        /^\s+(no\s*)?\|\s*([^|]*)\s*\|\s*([^|]*)\s*$/i
      );
      if (!match) {
        this.err("should be example with validity!");
        return;
      }
      const [, validColumn, fromLinkPath, toLinkPath] = match;
      const valid = !validColumn;
      try {
        await this._handler.handleExample(
          valid,
          trim(fromLinkPath),
          trim(toLinkPath)
        );
      } catch (e) {
        this.err(e);
      }
    } else {
      const match = this.line.match(/^\s+([^|]*)\s*\|\s*([^|]*)\s*$/i);
      if (!match) {
        this.err("should be example without validity!");
        return;
      }
      const [, fromLinkPath, toLinkPath] = match;
      try {
        await this._handler.handleExample(
          true,
          trim(fromLinkPath),
          trim(toLinkPath)
        );
      } catch (e) {
        this.err(e);
      }
    }
  }

  private async processObjectLine(): Promise<void> {
    const match = this.line.match(
      /^The\s+([A-Z0-9_:-]+)\s+with\s+id\s+([^\t]+)\s*$/i
    );
    if (!match) {
      this.err("should be valid object!");
      return;
    }
    const [, type, id] = match;
    try {
      await this._handler.handleObject(type.trim(), id.trim());
    } catch (e) {
      this.err(e);
    }
  }

  private async processFactLine(): Promise<void> {
    const match = this.line.match(/^\s+has\s+([a-z0-9_-]+)\s*:\s*([^\s].*)$/i);
    if (!match) {
      // note: already matched above
      this.err("should be valid link fact!");
      return;
    }
    const [, link, value] = match;
    try {
      await this._handler.handleFact(link.trim(), deserialize(value.trim()));
    } catch (e) {
      this.err(e);
    }
  }

  private async processToggleFactLine(): Promise<void> {
    const match = this.line.match(/^\s+([a-z0-9_-]+)$/i);
    if (!match) {
      // note: already matched above
      this.err("should be valid toggle fact!");
      return;
    }
    const [, link] = match;
    try {
      await this._handler.handleToggle(link.trim());
    } catch (e) {
      this.err(e);
    }
  }

  private async processMultiFactStart(): Promise<void> {
    const match = this.line.match(/^\s+has\s+([a-z0-9_-]+)\s*:\s*$/i);
    if (!match) {
      // note: already matched above
      this.err("should be valid multi value fact!");
      return;
    }
    const [, link] = match;
    try {
      await this._handler.handleMultiFactStart(link.trim());
    } catch (e) {
      this.err(e);
    }
  }

  private async processMultiFact(): Promise<void> {
    const value = this.line.trim();
    try {
      await this._handler.handleMultiFact(deserialize(value));
    } catch (e) {
      this.err(e);
    }
  }

  private async processNamespaceLine(match: RegExpMatchArray): Promise<void> {
    const [, prefix, uri] = match;
    try {
      await this._handler.handleNamespace(prefix, uri);
    } catch (e) {
      this.err(e);
    }
  }

  private async processCommentLine(match: RegExpMatchArray): Promise<void> {
    const [, comment] = match;
    const trimmedComment = comment.trim();
    try {
      await this._handler.handleComment(trimmedComment);
    } catch (e) {
      this.err(e);
    }
  }

  private async processSectionLine(match: RegExpMatchArray): Promise<void> {
    const [, section] = match;
    const trimmedSection = section.trim();
    try {
      await this._handler.handleSection(trimmedSection);
    } catch (e) {
      this.err(e);
    }
  }

  private async processStatement(match: RegExpMatchArray): Promise<void> {
    const [, statement] = match;
    const trimmedStatement = statement.trim();
    try {
      await this._handler.handleStatement(trimmedStatement);
    } catch (e) {
      this.err(e);
    }
  }

  private async processStartExample(match: RegExpMatchArray): Promise<void> {
    const [, validColumn, fromLinkPath, toLinkPath] = match;
    this.exampleFirstColumnIsValidity = !!validColumn;
    try {
      await this._handler.handleStartExample(
        this.exampleFirstColumnIsValidity,
        fromLinkPath.trim(),
        toLinkPath.trim()
      );
    } catch (e) {
      this.err(e);
    }
  }
}

function trim(str: string | undefined): string | undefined {
  if (str) {
    return str.trim();
  }
  return str;
}

function deserialize(value: string): string {
  let result = value;
  if (result.match(/^\\\s/) || result.match(/\\r/) || result.match(/\\n/)) {
    if (result.match(/^\\\s/)) {
      result = result.substring(1);
    }
    result = result
      .replace(/\\r/g, "\r")
      .replace(/\\n/g, "\n")
      .replace(/\\\\/g, "\\");
  }
  return result;
}
