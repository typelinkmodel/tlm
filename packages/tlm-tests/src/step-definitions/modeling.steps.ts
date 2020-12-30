/* tslint:disable:only-arrow-functions */

import {IModeler, TlmLink, TlmType} from "@typelinkmodel/tlm-core-model";
import {assert} from "chai";
import {Given, DataTable, Then, When} from "@cucumber/cucumber";
import {findType} from "../support/util";

Given(/^an empty type-link model is set up$/,
    async function() {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        modeler.initialize();
    });

Given(/^the namespace ([^ ]+) exists with uri ([^ ]+)$/,
    async function(ns: string, uri: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        await modeler.addNamespace(ns, uri);
    });

Given(/^the namespace ([^ ]+) is the active namespace$/,
    async function(ns: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        modeler.activeNamespace = ns;
    });

When(/^the modeling statement (.*) is added to the model:?$/,
    async function(statement: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        await modeler.addStatement(statement);
    });

Then(/^the model should contain the type ([^ ]+)$/,
    async function(type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const typeObj = findType(modeler, type);
        assert.isDefined(typeObj);
    });

Then(/^the model should contain the link ([^ ]+) from type ([^ ]+)$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        assert.isDefined(modeler.links[modeler.activeNamespace!][type][link]);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be constrained to values of type ([^ ]+)$/,
    async function(link: string, type: string, valueType: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        const valueTypeObj: TlmType = modeler.getValueTypeForLink(linkObj);
        assert.equal(valueTypeObj.name, valueType);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be singular$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isTrue(linkObj.isSingular);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be plural$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isFalse(linkObj.isSingular);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be optional$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isFalse(linkObj.isMandatory);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be mandatory$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isTrue(linkObj.isMandatory);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be a primary id$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isTrue(linkObj.isPrimaryId);
    });

Then(/^the type ([^ ]+) should have the supertype ([^ ]+)$/,
    async function(type: string, superType: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const typeObj = findType(modeler, type);
        const superTypeObj = findType(modeler, superType);
        assert.equal(typeObj.superType, superTypeObj.oid);
    });

Then(/^the description of type ([^ ]+) should be (.*)$/,
    async function(type: string, description: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const typeObj = findType(modeler, type);
        assert.equal(typeObj.description, description);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be singular for the target type$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isTrue(linkObj.isSingularTo);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be plural for the target type$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isFalse(linkObj.isSingularTo);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be mandatory for the target type$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isTrue(linkObj.isMandatoryTo);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be optional for the target type$/,
    async function(link: string, type: string) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isFalse(linkObj.isMandatoryTo);
    });

Given(/^this model:$/,
    async function(statements: DataTable) {
        // @ts-ignore
        const modeler: IModeler = this.modeler;
        for (const row of statements.raw()) {
            for (const cell of row) {
                await modeler.addStatement(cell);
            }
        }
    });
