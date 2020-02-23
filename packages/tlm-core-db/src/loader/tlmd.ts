import {IModeler, Modeler} from "@typelinkmodel/tlm-core-model";
import { createReadStream, ReadStream } from "fs";
import { createInterface } from "readline";
import {ILoader, IReader, ISearcher} from "../api";
import {Reader} from "../reader";
import {Searcher} from "../searcher";

enum STATE { INITIAL, MAIN, EXAMPLE_START, EXAMPLE_HEADER, EXAMPLE_DIVIDER, EXAMPLE }

enum TLMD_TYPE { MODEL, DATA, MESSAGE, UNKNOWN}

export class TlmdLoader implements ILoader {
    private readonly _modeler: IModeler;
    private readonly _reader: IReader;
    private readonly _searcher: ISearcher;

    constructor(modeler: IModeler = new Modeler(), reader: IReader = new Reader(),
                searcher: ISearcher = new Searcher()) {
        this._modeler = modeler;
        this._reader = reader;
        this._searcher = searcher;
    }

    public async loadFile(filename: string): Promise<void> {
        const handler = new TlmdStreamHandler(this._modeler, true);
        const loader = new TlmdFileLoader(filename, handler);
        await loader.loadFile();
    }
}

export class TlmdStreamHandler {
    private readonly _modeler: IModeler;
    private readonly _continueOnError: boolean;

    constructor(modeler: IModeler, continueOnError: boolean = false) {
        this._modeler = modeler;
        this._continueOnError = continueOnError;
    }

    // noinspection JSUnusedLocalSymbols
    public async handleNextLine(lineno: number, line: string): Promise<void> {
        console.debug(`${String(lineno).padStart(4)}: ${line}` );
    }

    // noinspection JSUnusedLocalSymbols
    public async handleStart(type: TLMD_TYPE, title: string | undefined): Promise<void> {
        console.debug(`TLMD Document type = '${type}', title = '${title}'`);
    }

    public async handleNamespace(prefix: string, uri: string): Promise<void> {
        console.debug(`Namespace prefix = '${prefix}', uri = '${uri}]`);
        await this._modeler.addNamespace(prefix, uri);
        if (!this._modeler.activeNamespace) {
            this._modeler.activeNamespace = prefix;
        }
    }

    // noinspection JSUnusedLocalSymbols
    public async handleComment(comment: string): Promise<void> {
        console.debug(`Comment: ${comment}`);
    }

    // noinspection JSUnusedLocalSymbols
    public async handleSection(section: string): Promise<void> {
        console.debug(`Section: ${section}`);
    }

    public async handleStatement(statement: string): Promise<void> {
        console.debug(`Statement: ${statement}`);
        await this._modeler.addStatement(statement);
    }

    // noinspection JSUnusedLocalSymbols
    public async handleStartExample(firstColumnIsValidity: boolean, fromLinkPath: string,
                                    toLinkPath: string): Promise<void> {
        console.debug(`Start example: has invalid examples? ${firstColumnIsValidity},`
            + ` from = '${fromLinkPath}', 'to = ${toLinkPath}'`);
    }

    // noinspection JSUnusedLocalSymbols
    public async handleExample(valid: boolean,
                               fromLinkPath: string | undefined, toLinkPath: string | undefined): Promise<void> {
        console.debug(`Example: ok? ${valid}, from = '${fromLinkPath}', to = '${toLinkPath}'`);
    }

    public handleError(filename: string, lineno: number, error: string): void {
        const message = `Error parsing ${filename} on line ${lineno}: ${error}`;
        if (this._continueOnError) {
            console.error(message);
        } else {
            throw new Error(message);
        }
    }
}

export class TlmdFileLoader {
    private readonly  _handler: TlmdStreamHandler;
    private readonly _filename: string;

    private state: STATE = STATE.INITIAL;
    private lineno: number = 0;
    private line: string = "";
    private exampleFirstColumnIsValidity: boolean = false;

    private readonly _lineProcessors = [
        /Namespace\s+([^:]+):\s*(.*)/i,
        async (st: RegExpMatchArray) => await this.processNamespaceLine(st),
        /\/\/\s*(.*)/i,
        async (st: RegExpMatchArray) => await this.processCommentLine(st),
        /---\s*(.*)/i,
        async (st: RegExpMatchArray) => await this.processSectionLine(st),
        /^([A-Za-z].*\.)$/i,
        async (st: RegExpMatchArray) => await this.processStatement(st),
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

    private err(error: string): void {
        this._handler.handleError(this._filename, this.lineno, error);
        this.state = STATE.MAIN;
    }

    private async processLine(): Promise<void> {
        await this._handler.handleNextLine(this.lineno, this.line);
        let match;
        switch (this.state) {
            case STATE.INITIAL:
                this.state = STATE.MAIN;
                this.processStartLine();
                break;
            case STATE.MAIN:
                if (this.line.match(/^\s*$/i)) {
                    // ignore whitespace
                } else if (this.line.match(/^\s+Examples:\s*$/i)) {
                    this.state = STATE.EXAMPLE_START;
                } else {
                    await this.processBodyLine();
                }
                break;
            case STATE.EXAMPLE_START:
                match = this.line.match(
                    /^\s+(ok\s*\|\s*)?([A-Za-z0-9_\/-]+)\s*\|\s*([A-Za-z0-9_\/-]+)\s*$/i);
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
                if (this.line.match(/^\s*$/i)) {
                    // empty line ends example
                    this.state = STATE.MAIN;
                } else if (this.line.match(/^\s+/i)) {
                    // did not match first regex so line contains some non-whitespace
                    await this.processExampleLine();
                    // if the handler is swallowing errors, still assume examples continue next line
                    this.state = STATE.EXAMPLE;
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
        const match = this.line.match(/# TLM\s+([A-Za-z]+)\s*(?::(.*))?/i);
        if (!match) {
            this.err("missing TLMD type!");
            return;
        }
        // noinspection JSUnusedLocalSymbols
        const [_, tlmdTypeString, titleString] = match;

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
            this.err(e.message);
        }
    }

    private async processBodyLine(): Promise<void> {
        for (let i = 0; i < this._lineProcessors.length; i++) {
            const regex = this._lineProcessors[i] as RegExp;
            const processor = this._lineProcessors[++i] as (st: RegExpMatchArray) => Promise<void>;
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
                /^\s+(no\s*)?\|\s*([^|]*)\s*\|\s*([^|]*)\s*$/i);
            if (!match) {
                this.err("should be example with validity!");
                return;
            }
            // noinspection JSUnusedLocalSymbols
            const [_, validColumn, fromLinkPath, toLinkPath] = match;
            const valid = (!validColumn);
            try {
                await this._handler.handleExample(valid, trim(fromLinkPath), trim(toLinkPath));
            } catch (e) {
                this.err(e.message);
            }
        } else {
            const match = this.line.match(
                /^\s+([^|]*)\s*\|\s*([^|]*)\s*$/i);
            if (!match) {
                this.err("should be example without validity!");
                return;
            }
            // noinspection JSUnusedLocalSymbols
            const [_, fromLinkPath, toLinkPath] = match;
            try {
                await this._handler.handleExample(true, trim(fromLinkPath), trim(toLinkPath));
            } catch (e) {
                this.err(e.message);
            }
        }
    }

    private async processNamespaceLine(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, prefix, uri] = match;
        try {
            await this._handler.handleNamespace(prefix, uri);
        } catch (e) {
            this.err(e.message);
        }
    }

    private async processCommentLine(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, comment] = match;
        const trimmedComment = comment.trim();
        try {
            await this._handler.handleComment(trimmedComment);
        } catch (e) {
            this.err(e.message);
        }
    }

    private async processSectionLine(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, section] = match;
        const trimmedSection = section.trim();
        try {
            await this._handler.handleSection(trimmedSection);
        } catch (e) {
            this.err(e.message);
        }
    }

    private async processStatement(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, statement] = match;
        const trimmedStatement = statement.trim();
        try {
            await this._handler.handleStatement(trimmedStatement);
        } catch (e) {
            this.err(e.message);
        }
    }

    private async processStartExample(match: RegExpMatchArray): Promise<void> {
        // noinspection JSUnusedLocalSymbols
        const [_, validColumn, fromLinkPath, toLinkPath] = match;
        this.exampleFirstColumnIsValidity = !!validColumn;
        try {
            await this._handler.handleStartExample(this.exampleFirstColumnIsValidity,
                fromLinkPath.trim(), toLinkPath.trim());
        } catch (e) {
            this.err(e.message);
        }
    }
}

function trim(str: string | undefined): string | undefined {
    if (str) {
        return str.trim();
    }
    return str;
}
