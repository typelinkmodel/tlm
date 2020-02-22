import {IModeler, Modeler} from "@typelinkmodel/tlm-core-model";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import {ILoader, IReader, ISearcher} from "../api";
import {Reader} from "../reader";
import {Searcher} from "../searcher";

enum STATES { INITIAL, MAIN };

enum TLMD_TYPES { MODEL, DATA, MESSAGE};

export class TlmdLoader implements ILoader {
    private _modeler: IModeler;
    private _reader: IReader;
    private _searcher: ISearcher;

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

    constructor(modeler: IModeler = new Modeler(), reader: IReader = new Reader(),
                searcher: ISearcher = new Searcher()) {
        this._modeler = modeler;
        this._reader = reader;
        this._searcher = searcher;
    }

    public async loadFile(filename: string): Promise<void> {
        const stream = createReadStream(filename);
        const reader = createInterface(stream);

        let state = STATES.INITIAL;
        let lineno = 0;
        let tlmdType = TLMD_TYPES.DATA;
        let tlmdTitle = "";

        for await (const line of reader) {
            lineno++;
            // console.debug(`${lineno}: ${line}` );
            switch (state) {
                case STATES.INITIAL:
                    if (!line.startsWith("# TLM")) {
                        throw new Error(`.tlmd file must start with a '# TLM' start line, not '${line}!`);
                    }
                    const match = line.match(/# TLM\s+(Model|Data|Message)\s*(?::(.*))?/i);
                    if (!match) {
                        throw new Error(`Error parsing start line #${lineno}, missing TLMD file type!`);
                    }
                    const [_, tlmdTypeString, titleString] = match;
                    if (tlmdTypeString.match(/Model/i)) {
                        tlmdType = TLMD_TYPES.MODEL;
                    } else if (tlmdTypeString.match(/Data/i)) {
                        tlmdType = TLMD_TYPES.DATA;
                    } else {
                        tlmdType = TLMD_TYPES.MESSAGE;
                    }
                    if (titleString) {
                        tlmdTitle = titleString.trim();
                    }
                    // console.debug(`TLMD Type: ${tlmdType}`);
                    // console.debug(`TLMD Title: ${tlmdTitle}`);
                    state = STATES.MAIN;
                    break;
                case STATES.MAIN:
                    if (line.match(/^\s*$/i)) {
                        // ignore whitespace only
                    } else if (line.match(/^\s.*/i)) {
                        // ignore example
                    } else {
                        await this.loadLine(line, lineno);
                    }
                    break;
                default:
                    throw new Error(`After line #${lineno}: Unknown parser state ${state}`);
            }
        }
        stream.close();
    }

    private async loadLine(line: string, lineno: number) {
        for (let i = 0; i < this._lineProcessors.length; i++) {
            const regex = this._lineProcessors[i] as RegExp;
            const processor = this._lineProcessors[++i] as (st: RegExpMatchArray) => Promise<void>;
            const match = line.match(regex);
            if (match) {
                await processor(match);
                return;
            }
        }
        throw new Error(`Cannot process line #${lineno}: ${line}`);
    }

    // noinspection JSMethodCanBeStatic
    private async processNamespaceLine(match: RegExpMatchArray) {
        const [_, prefix, uri] = match;
        // console.debug(`Namespace prefix: ${prefix}`);
        // console.debug(`Namespace uri: ${uri}`);
        await this._modeler.addNamespace(prefix, uri);
        if (!this._modeler.activeNamespace) {
            this._modeler.activeNamespace = prefix;
        }
    }

    // noinspection JSMethodCanBeStatic
    private async processCommentLine(match: RegExpMatchArray) {
        const [_, comment] = match;
        const trimmedComment = comment.trim();
        // console.debug(`Comment: ${trimmedComment}`);
    }

    // noinspection JSMethodCanBeStatic
    private async processSectionLine(match: RegExpMatchArray) {
        const [_, section] = match;
        const trimmedSection = section.trim();
        // console.debug(`Section: ${trimmedSection}`);
    }

    // noinspection JSMethodCanBeStatic
    private async processStatement(match: RegExpMatchArray) {
        const [_, statement] = match;
        // console.debug(`Statement: ${statement}`);
        await this._modeler.addStatement(statement);
    }
}
