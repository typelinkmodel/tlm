import {IModeler, TlmType} from "@typelinkmodel/tlm-core-model";

export function findType(modeler: IModeler, type: string): TlmType {
    if (type.includes(":")) {
        const [typeNs, typeName, ..._] = type.split(":");
        return modeler.types[typeNs][typeName];
    } else {
        return modeler.types[modeler.activeNamespace!][type];
    }
}
