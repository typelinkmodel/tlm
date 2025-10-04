import {
  loadCoreSchema,
  TLM_CORE_LINKS,
  TLM_CORE_NAMESPACES,
  TLM_CORE_TYPES,
} from "../../src";

test("loadCoreSchema", async () => {
  loadCoreSchema();
  loadCoreSchema();
  expect(TLM_CORE_NAMESPACES).toHaveLength(2);
  const tlmNs = TLM_CORE_NAMESPACES[0];
  expect(tlmNs.oid).toBe(1);
  expect(tlmNs.prefix).toBe("tlm");
  expect(tlmNs.uri).toBe("https://type.link.model.tools/ns/tlm/");

  const xsNs = TLM_CORE_NAMESPACES[1];
  expect(xsNs.oid).toBe(2);
  expect(xsNs.prefix).toBe("xs");
  expect(xsNs.uri).toBe("http://www.w3.org/2001/XMLSchema");

  expect(TLM_CORE_TYPES).toHaveLength(55);
  const valueFact = TLM_CORE_TYPES[TLM_CORE_TYPES.length - 1];
  expect(valueFact.oid).toBe(78);
  expect(valueFact.namespace).toBe(1);
  expect(valueFact.superType).toBe(74);
  expect(valueFact.description).toMatch(/primitive value/);

  expect(TLM_CORE_LINKS).toHaveLength(21);
  const toggleLink = TLM_CORE_LINKS[TLM_CORE_LINKS.length - 1];
  expect(toggleLink.oid).toBe(77);
  expect(toggleLink.fromType).toBe(76);
  expect(toggleLink.toType).toBe(7);
  expect(toggleLink.name).toBe("toggle");
});
