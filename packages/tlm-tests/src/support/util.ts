/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IModeler, TlmType } from "@typelinkmodel/tlm-core-model";

export function findType(modeler: IModeler, type: string): TlmType {
  if (type.includes(":")) {
    const [typeNs, typeName] = type.split(":");
    return modeler.types[typeNs][typeName];
  } else {
    return modeler.types[modeler.activeNamespace!][type];
  }
}
