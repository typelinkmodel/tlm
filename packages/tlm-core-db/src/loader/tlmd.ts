import { createReadStream, type ReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { type IModeler, Modeler } from "@typelinkmodel/tlm-core-model";
import type { ILoader, IReader, ISearcher } from "../api";
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

// The following regexes flag on SonarCloud rule S5852 (ReDoS risk from
// overlapping quantifiers). The parser only consumes local, developer-authored
// TLMD files — not untrusted input — so ReDoS is not a realistic threat here.
const MULTI_FACT_VALUE_RE = /^\s+(.*)$/i; // NOSONAR S5852
const EXAMPLE_WITH_VALIDITY_RE = /^\s+(no\s*)?\|\s*([^|]*)\s*\|\s*([^|]*)\s*$/i; // NOSONAR S5852
const EXAMPLE_WITHOUT_VALIDITY_RE = /^\s+([^|]*)\s*\|\s*([^|]*)\s*$/i; // NOSONAR S5852
const OBJECT_LINE_RE = /^The\s+([A-Z0-9_:-]+)\s+with\s+id\s+([^\t]+)\s*$/i; // NOSONAR S5852

export class TlmdLoader implements ILoader {
  private readonly _modeler: IModeler;
  private readonly _reader: IReader;
  private readonly _searcher: ISearcher;
  private readonly _continueOnError: boolean;
  private readonly _debug: boolean;

  constructor(
    modeler: IModeler = new Modeler(),

    reader: IReader = new Reader(),

    searcher: ISearcher = new Searcher(),
    continueOnError = false,
    debug = false,
  ) {
    this._modeler = modeler;
    this._reader = reader;
    this._searcher = searcher;
    this._continueOnError = continueOnError;
    this._debug = debug;
  }

  public async loadFile(filename: string): Promise<void> {
    const handler = new TlmdStreamHandler(
      this._modeler,
      this._continueOnError,
      this._debug,
    );
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

  // eslint-disable-next-line @typescript-eslint/require-await
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

  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleStart(
    type: TLMD_TYPE,
    title: string | undefined,
  ): Promise<void> {
    this.debug(`TLMD Document type = '${TLMD_TYPE[type]}', title = '${title}'`);
  }

  public async handleNamespace(prefix: string, uri: string): Promise<void> {
    this.debug(`Namespace prefix = '${prefix}', uri = '${uri}'`);
    await this._modeler.addNamespace(prefix, uri);
    if (!this._modeler.activeNamespace) {
      this._modeler.activeNamespace = prefix;
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleComment(comment: string): Promise<void> {
    this.debug(`Comment: ${comment}`);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleSection(section: string): Promise<void> {
    this.debug(`Section: ${section}`);
  }

  public async handleStatement(statement: string): Promise<void> {
    this.debug(`Statement: ${statement}`);
    await this._modeler.addStatement(statement);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleStartExample(
    firstColumnIsValidity: boolean,
    fromLinkPath: string,
    toLinkPath: string,
  ): Promise<void> {
    this.debug(
      `Start example: has invalid examples? ${firstColumnIsValidity},` +
        ` from = '${fromLinkPath}', 'to = ${toLinkPath}'`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleExample(
    valid: boolean,
    fromLinkPath: string | undefined,
    toLinkPath: string | undefined,
  ): Promise<void> {
    this.debug(
      `Example: ok? ${valid}, from = '${fromLinkPath}', to = '${toLinkPath}'`,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleObject(type: string, id: string): Promise<void> {
    this.debug(`Object: type = '${type}', id = '${id}'`);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleFact(link: string, value: string): Promise<void> {
    this.debug(`- fact: link = '${link}', value = '${value}'`);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleToggle(link: string): Promise<void> {
    this.debug(`- toggle fact: link = '${link}'`);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public async handleMultiFactStart(link: string): Promise<void> {
    this.debug(`- multi fact: link = '${link}'`);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
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
    async (st: RegExpExecArray) => this.processNamespaceLine(st),
    /\/\/\s*(.*)/i,
    async (st: RegExpExecArray) => this.processCommentLine(st),
    /---\s*(.*)/i,
    async (st: RegExpExecArray) => this.processSectionLine(st),
    /^(An?\s+.*\.)$/i,
    async (st: RegExpExecArray) => this.processStatement(st),
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

  private err(error: unknown): void {
    let errorString: string;
    if (error instanceof Error) {
      errorString = error.toString();
    } else if (typeof error === "string") {
      errorString = error;
    } else {
      errorString = "unknown";
    }
    this._handler.handleError(this._filename, this.lineno, errorString);
    this.state = STATE.MAIN;
  }

  private async processLine(): Promise<void> {
    await this._handler.handleNextLine(this.lineno, this.line);

    if (/^\s*$/i.test(this.line)) {
      // empty line resets to main
      this.state = STATE.MAIN;
      return;
    }

    switch (this.state) {
      case STATE.INITIAL:
        this.state = STATE.MAIN;
        await this.processStartLine();
        return;
      case STATE.MAIN:
        return this.handleMainState();
      case STATE.EXAMPLE_START:
        return this.handleExampleStartState();
      case STATE.EXAMPLE_HEADER:
        return this.handleExampleHeaderState();
      case STATE.EXAMPLE_DIVIDER:
        await this.processExampleLine();
        this.state = STATE.EXAMPLE;
        return;
      case STATE.EXAMPLE:
        return this.handleExampleState();
      case STATE.DATA:
        return this.handleDataState();
      case STATE.DATA_MULTI_FACT:
        return this.handleDataMultiFactState();
      default:
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        this.err(`unknown parser state ${this.state}!`);
    }
  }

  private async handleMainState(): Promise<void> {
    if (/^\s+Examples:\s*$/i.test(this.line)) {
      this.state = STATE.EXAMPLE_START;
    } else if (/^The\s/i.test(this.line)) {
      this.state = STATE.DATA;
      await this.processObjectLine();
    } else {
      await this.processBodyLine();
    }
  }

  private async handleExampleStartState(): Promise<void> {
    const match =
      /^\s+(ok\s*\|\s*)?([A-Z0-9_/-]+)\s*\|\s*([A-Z0-9_/-]+)\s*$/i.exec(
        this.line,
      );
    if (match) {
      await this.processStartExample(match);
      this.state = STATE.EXAMPLE_HEADER;
    } else {
      this.err("expected example header!");
    }
  }

  private async handleExampleHeaderState(): Promise<void> {
    const match = /^\s+[=|-]+\s*$/i.exec(this.line);
    if (match) {
      this.state = STATE.EXAMPLE_DIVIDER;
    } else {
      // assume no divider and instead look for example
      this.state = STATE.EXAMPLE;
      await this.processExampleLine();
    }
  }

  private async handleExampleState(): Promise<void> {
    if (/^\s+/i.test(this.line)) {
      // did not match first regex so line contains some non-whitespace
      await this.processExampleLine();
      // if the handler is swallowing errors, still assume examples continue next line
      this.state = STATE.EXAMPLE;
    } else {
      this.state = STATE.MAIN;
      await this.processBodyLine();
    }
  }

  private async handleDataState(): Promise<void> {
    if (/^The\s/i.test(this.line)) {
      await this.processObjectLine();
      // if the handler is swallowing errors, still assume data continues next line
      this.state = STATE.DATA;
    } else if (/^\s+has\s+[a-z0-9_-]+\s*:\s*$/i.test(this.line)) {
      this.state = STATE.DATA_MULTI_FACT;
      await this.processMultiFactStart();
      // if the handler is swallowing errors, still assume data continues next line
      this.state = STATE.DATA_MULTI_FACT;
    } else if (/^\s+has\s+[a-z0-9_-]+\s*:\s*[^\s].*$/i.test(this.line)) {
      await this.processFactLine();
      // if the handler is swallowing errors, still assume data continues next line
      this.state = STATE.DATA;
    } else if (/^\s+[a-z0-9_-]+\s*$/i.test(this.line)) {
      await this.processToggleFactLine();
      // if the handler is swallowing errors, still assume data continues next line
      this.state = STATE.DATA;
    } else {
      this.state = STATE.MAIN;
      await this.processBodyLine();
    }
  }

  private async handleDataMultiFactState(): Promise<void> {
    if (MULTI_FACT_VALUE_RE.test(this.line)) {
      await this.processMultiFact();
      // if the handler is swallowing errors, still assume data continues next line
      this.state = STATE.DATA_MULTI_FACT;
    } else if (/^The\s/i.test(this.line)) {
      this.state = STATE.DATA;
      await this.processObjectLine();
    } else {
      this.state = STATE.MAIN;
      await this.processBodyLine();
    }
  }

  private async processStartLine(): Promise<void> {
    if (!this.line.startsWith("# TLM")) {
      this.err("expected a '# TLM' start line!");
      return;
    }
    const match = /# TLM\s+([A-Z]+)\s*(?::(.*))?/i.exec(this.line);
    if (!match) {
      this.err("missing TLMD type!");
      return;
    }
    const [, tlmdTypeString, titleString] = match;

    let tlmdType: TLMD_TYPE;
    if (/^Model$/i.test(tlmdTypeString)) {
      tlmdType = TLMD_TYPE.MODEL;
    } else if (/^Data$/i.test(tlmdTypeString)) {
      tlmdType = TLMD_TYPE.DATA;
    } else if (/^Message$/i.test(tlmdTypeString)) {
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
        st: RegExpExecArray,
      ) => Promise<void>;
      const match = regex.exec(this.line);
      if (match) {
        await processor(match);
        return;
      }
    }

    this.err(`no way to process this line!`);
  }

  private async processExampleLine(): Promise<void> {
    if (this.exampleFirstColumnIsValidity) {
      const match = EXAMPLE_WITH_VALIDITY_RE.exec(this.line);
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
          trim(toLinkPath),
        );
      } catch (e) {
        this.err(e);
      }
    } else {
      const match = EXAMPLE_WITHOUT_VALIDITY_RE.exec(this.line);
      if (!match) {
        this.err("should be example without validity!");
        return;
      }
      const [, fromLinkPath, toLinkPath] = match;
      try {
        await this._handler.handleExample(
          true,
          trim(fromLinkPath),
          trim(toLinkPath),
        );
      } catch (e) {
        this.err(e);
      }
    }
  }

  private async processObjectLine(): Promise<void> {
    const match = OBJECT_LINE_RE.exec(this.line);
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
    const match = /^\s+has\s+([a-z0-9_-]+)\s*:\s*([^\s].*)$/i.exec(this.line);
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
    const match = /^\s+([a-z0-9_-]+)$/i.exec(this.line);
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
    const match = /^\s+has\s+([a-z0-9_-]+)\s*:\s*$/i.exec(this.line);
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

  private async processNamespaceLine(match: RegExpExecArray): Promise<void> {
    const [, prefix, uri] = match;
    try {
      await this._handler.handleNamespace(prefix, uri);
    } catch (e) {
      this.err(e);
    }
  }

  private async processCommentLine(match: RegExpExecArray): Promise<void> {
    const [, comment] = match;
    const trimmedComment = comment.trim();
    try {
      await this._handler.handleComment(trimmedComment);
    } catch (e) {
      this.err(e);
    }
  }

  private async processSectionLine(match: RegExpExecArray): Promise<void> {
    const [, section] = match;
    const trimmedSection = section.trim();
    try {
      await this._handler.handleSection(trimmedSection);
    } catch (e) {
      this.err(e);
    }
  }

  private async processStatement(match: RegExpExecArray): Promise<void> {
    const [, statement] = match;
    const trimmedStatement = statement.trim();
    try {
      await this._handler.handleStatement(trimmedStatement);
    } catch (e) {
      this.err(e);
    }
  }

  private async processStartExample(match: RegExpExecArray): Promise<void> {
    const [, validColumn, fromLinkPath, toLinkPath] = match;
    this.exampleFirstColumnIsValidity = !!validColumn;
    try {
      await this._handler.handleStartExample(
        this.exampleFirstColumnIsValidity,
        fromLinkPath.trim(),
        toLinkPath.trim(),
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
  if (/^\\\s/.test(result) || /\\r/.test(result) || /\\n/.test(result)) {
    if (/^\\\s/.test(result)) {
      result = result.substring(1);
    }
    result = result
      .replace(/\\r/g, "\r")
      .replace(/\\n/g, "\n")
      .replace(/\\\\/g, "\\");
  }
  return result;
}
