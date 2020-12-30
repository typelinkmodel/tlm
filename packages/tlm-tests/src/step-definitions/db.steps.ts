import {ILoader, IReader, ISearcher} from "@typelinkmodel/tlm-core-db";
import {TlmFact, TlmObject} from "@typelinkmodel/tlm-core-model";
import {assert} from "chai";
import {Given, DataTable, Then} from "@cucumber/cucumber";

Given(/^this file is loaded:$/,
    async function(statements: DataTable) {
        // @ts-ignore
        const loader: ILoader = this.loader;
        for (const row of statements.raw()) {
            for (const cell of row) {
                await loader.loadFile(cell);
            }
        }
    });

Then(/^the ([^ ]+) with ([^ ]+) "([^"]*)" should exist$/,
    async function(type: string, link: string, value: string) {
        // @ts-ignore
        const searcher: ISearcher = this.searcher;
        const object: TlmObject|undefined = await searcher.findUnique({type, link, value});
        assert.isDefined(object);
    });

Then(/^the ([^ ]+) with ([^ ]+) "([^"]*)" should have ([^ ]+) "([^"]*)"$/,
    async function(type: string, link: string, value: string, assertLink: string, assertValue: string) {
        // @ts-ignore
        const searcher: ISearcher = this.searcher;
        const object: TlmObject|undefined = await searcher.findUnique({type, link, value});

        // @ts-ignore
        const reader: IReader = this.reader;
        const fact: TlmFact = await reader.readFactUnique(object!, {links: [assertLink]})!;

        assert.equal(fact.value, assertValue);
    });

Then(/^the ([^ ]+) with ([^ ]+) "([^"]*)" should have a ([^ ]+) with ([^ ]+) "([^"]*)"$/,
    async function(type: string, link: string, value: string, assertLink: string, assertValueLink: string,
                   assertValue: string) {
        // @ts-ignore
        const searcher: ISearcher = this.searcher;
        const object: TlmObject|undefined = await searcher.findUnique({type, link, value});
        const target: TlmObject|undefined = await searcher.findUnique({object, link});

        // @ts-ignore
        const reader: IReader = this.reader;
        const fact: TlmFact = await reader.readFactUnique(target!, {links: [assertValueLink]})!;

        assert.equal(fact.value, assertValue);
    });
