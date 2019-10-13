/* tslint:disable:only-arrow-functions */

import {IModeler, TlmLink, TlmType} from "@typelinkmodel/tlm-core-model";
import {assert} from "chai";
import {Given, TableDefinition, Then, When} from "cucumber";

Given(/^an empty type\-link model is set up$/,
    async function() {
        const modeler: IModeler = this.modeler;
        modeler.initialize();
    });

Given(/^the namespace ([^ ]+) exists with uri ([^ ]+)$/,
    async function(ns: string, uri: string) {
        const modeler: IModeler = this.modeler;
        modeler.addNamespace(ns, uri);
    });

Given(/^the namespace ([^ ]+) is the active namespace$/,
    async function(ns: string) {
        const modeler: IModeler = this.modeler;
        modeler.activeNamespace = ns;
    });

When(/^the modeling statement (.*) is added to the model:?$/,
    async function(statement: string) {
        const modeler: IModeler = this.modeler;
        modeler.addStatement(statement);
    });

Then(/^the model should contain the type ([^ ]+)$/,
    async function(type: string) {
        const modeler: IModeler = this.modeler;
        const types = modeler.types[modeler.activeNamespace!];
        const typeObj = types[type];
        assert.isDefined(typeObj);
    });

Then(/^the model should contain the link ([^ ]+) from type ([^ ]+)$/,
    async function(link: string, type: string) {
        const modeler: IModeler = this.modeler;
        assert.isDefined(modeler.links[modeler.activeNamespace!][type][link]);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be constrained to values of type ([^ ]+)$/,
    async function(link: string, type: string, valueType: string) {
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        const valueTypeObj: TlmType = modeler.getValueTypeForLink(linkObj);
        assert.equal(valueTypeObj.name, valueType);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be singular$/,
    async function(link: string, type: string) {
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isTrue(linkObj.isSingular);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be plural$/,
    async function(link: string, type: string) {
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isFalse(linkObj.isSingular);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be optional$/,
    async function(link: string, type: string) {
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isFalse(linkObj.isMandatory);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be mandatory$/,
    async function(link: string, type: string) {
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isTrue(linkObj.isMandatory);
    });

Then(/^the link ([^ ]+) from type ([^ ]+) should be a primary id$/,
    async function(link: string, type: string) {
        const modeler: IModeler = this.modeler;
        const linkObj: TlmLink = modeler.links[modeler.activeNamespace!][type][link];
        assert.isTrue(linkObj.isPrimaryId);
    });

Given(/^this model:$/,
    async function(statements: TableDefinition) {
        const modeler: IModeler = this.modeler;
        for (const row of statements.raw()) {
            for (const cell of row) {
                modeler.addStatement(cell);
            }
        }
    });
