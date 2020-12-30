import { TlmLink, TlmNamespace, TlmType } from "../core";

export interface ITlmNamespaceMap {
  [prefix: string]: TlmNamespace;
}

export interface ITlmTypeMap {
  [namespacePrefix: string]: { [typeName: string]: TlmType };
}

export interface ITlmLinkMap {
  [namespacePrefix: string]: {
    [typeName: string]: { [linkName: string]: TlmLink };
  };
}

export interface IModeler {
  readonly namespaces: ITlmNamespaceMap;
  readonly types: ITlmTypeMap;
  readonly links: ITlmLinkMap;
  activeNamespace?: string;

  initialize(): void;

  addNamespace(
    prefix: string,
    uri: string,
    description?: string
  ): Promise<TlmNamespace>;

  addStatement(statement: string): Promise<void>;

  getValueTypeForLink(link: TlmLink): TlmType;

  getTypeByName(type: string): TlmType;
}
