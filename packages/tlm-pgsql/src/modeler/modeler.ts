import { Modeler as CoreModeler } from "@typelinkmodel/tlm-core-model";
import { LinkModel } from "@typelinkmodel/tlm-core-model/lib/modeler/link";
import { NamespaceModel } from "@typelinkmodel/tlm-core-model/lib/modeler/namespace";
import { TypeModel } from "@typelinkmodel/tlm-core-model/lib/modeler/type";
import { Pool } from "pg";
import { OidGenerator } from "./oid";

// noinspection JSUnusedGlobalSymbols
export class Modeler extends CoreModeler {
  // noinspection JSUnusedGlobalSymbols
  constructor(
    pool: Pool,
    oidGenerator: OidGenerator = new OidGenerator(pool),
    namespaceModel: NamespaceModel = new NamespaceModel(oidGenerator),
    typeModel: TypeModel = new TypeModel(oidGenerator, namespaceModel),
    linkModel: LinkModel = new LinkModel(
      oidGenerator,
      namespaceModel,
      typeModel
    )
  ) {
    super(oidGenerator, namespaceModel, typeModel, linkModel);
  }
}
