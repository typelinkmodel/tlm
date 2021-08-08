/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-unsafe-assignment */
import * as parse from "csv-parse/lib/sync";
import { TlmLink, TlmNamespace, TlmType } from "./schema";

export function csv_cast(value: string, context: { [key: string]: any }): any {
  switch (context.column) {
    case "oid":
    case "namespace":
    case "super_type":
    case "from_type":
    case "to_type":
      return parseInt(value, 10);
    // case /^is_/.test(context.column):
    case "is_singular_from":
    case "is_singular_to":
    case "is_mandatory_from":
    case "is_mandatory_to":
    case "is_toggle":
    case "is_value":
    case "is_primary_id":
      return value !== "false";
    default:
      return value;
  }
}

const CSV_OPTIONS = {
  columns: true,
  skip_empty_lines: true,
  cast: csv_cast,
};

const NAMESPACE_DATA = `
oid,prefix,uri,description
1,tlm,https://type.link.model.tools/ns/tlm/,The Core TLM namespace.
2,xs,http://www.w3.org/2001/XMLSchema,Namespaces for XML Schema DataTypes.
`;

const TYPES_DATA = `
oid,namespace,name,super_type,description
3,1,Namespace,4,The special Type for Namespaces.
4,1,Type,4,The special Type for Types (the meta-Type).
5,1,ValueType,4,Simple kind of Object that is a simple primitive value.
6,2,DataType,5,XML Schema compatible value.
7,2,boolean,6,XML Schema compatible boolean.
8,2,float,6,XML Schema compatible float.
9,2,double,6,XML Schema compatible double.
10,2,decimal,6,XML Schema compatible decimal.
11,2,integer,10,XML Schema compatible integer.
12,2,long,11,XML Schema compatible long.
13,2,int,12,XML Schema compatible int.
14,2,short,13,XML Schema compatible short.
15,2,byte,14,XML Schema compatible byte.
16,2,string,6,XML Schema compatible string.
17,2,anyURI,6,XML Schema compatible anyURI.
18,2,duration,6,XML Schema compatible duration.
19,2,dateTime,6,XML Schema compatible dateTime.
20,2,time,6,XML Schema compatible time.
21,2,date,6,XML Schema compatible date.
22,2,gYearMonth,6,XML Schema compatible date.
23,2,gYear,6,XML Schema compatible gYear.
24,2,gMonthDay,6,XML Schema compatible gMonthDay.
25,2,gDay,6,XML Schema compatible gDay.
26,2,gMonth,6,XML Schema compatible gMonth.
27,2,dateTimeStamp,19,XML Schema compatible dateTimeStamp.
28,2,dayTimeDuration,18,XML Schema compatible dayTimeDuration.
29,2,yearMonthDuration,18,XML Schema compatible yearMonthDuration.
30,2,base64Binary,6,XML Schema compatible base64Binary.
31,2,hexBinary,6,XML Schema compatible hexBinary.
32,2,nonPositiveInteger,11,XML Schema compatible nonPositiveInteger.
33,2,negativeInteger,32,XML Schema compatible negativeInteger.
34,2,nonNegativeInteger,11,XML Schema compatible nonNegativeInteger.
35,2,positiveInteger,34,XML Schema compatible positiveInteger.
36,2,unsignedLong,34,XML Schema compatible unsignedLong.
37,2,unsignedInt,36,XML Schema compatible unsignedInt.
38,2,unsignedShort,37,XML Schema compatible unsignedShort.
39,2,unsignedByte,38,XML Schema compatible unsignedByte.
40,2,normalizedString,16,XML Schema compatible normalizedString.
41,2,token,40,XML Schema compatible token.
42,2,language,41,XML Schema compatible language.
43,2,NMTOKEN,41,XML Schema compatible NMTOKEN.
44,2,Name,41,XML Schema compatible Name.
45,2,NCName,44,XML Schema compatible NCName.
46,2,IDREF,45,XML Schema compatible IDREF.
47,2,ID,45,XML Schema compatible ID.
48,2,ENTITY,45,XML Schema compatible ENTITY.
49,1,URI,17,An ASCII uniform resource identifier per RFC3986.
50,1,URL,49,An ASCII uniform resource locator per WHATWG URL Standard.
51,1,URN,49,An ASCII uniform resource name per RFC8141.
52,1,UUID,51,An ASCII universally unique identifier per RFC4122.
53,1,Link,4,A relation between types.
71,1,Fact,4,A statement about an identified Object in the world considered to be true.
74,1,LinkFact,71,A fact about an object its relation to another object.
76,1,ToggleFact,71,A fact about an object that is either true (defined) or false (absent).
78,1,ValueFact,74,A fact about an object that has as its target a primitive value.
`;

const LINKS_DATA = `
"oid","from_type","to_type","name","from_name","to_name","is_singular_from","is_singular_to","is_mandatory_from","is_mandatory_to","is_toggle","is_value","is_primary_id","description"
"54","53","4","from type",,,"true","false","true","false","false","false","false","The type this link belongs to."
"55","53","4","to type",,,"true","false","true","false","false","false","false","The type this link points to."
"56","53","44","name",,,"true","false","true","false","false","true","false","The name of the link."
"57","53","16","from name",,,"true","false","false","false","false","true","false","The name for the link for the ""from"" type."
"58","53","16","to name",,,"true","false","false","false","false","true","false","The name for the link for the ""to"" type."
"59","53","7","is singular",,,"true","false","true","false","true","true","false","Whether there can be a single link like this for the ""from"" type."
"60","53","7","is mandatory",,,"true","false","true","false","true","true","false","Whether there has to be a value for the ""from"" type."
"61","53","7","is toggle",,,"true","false","true","false","true","true","false","Whether this is a simple boolean link."
"62","53","7","is value",,,"true","false","true","false","true","true","false","Whether this link is to a ValueType."
"63","53","7","is primary id",,,"true","false","true","false","true","true","false","Whether this link is to a primary identifier."
"64","3","45","prefix",,,"true","false","true","false","false","true","false","Shorthand identifier for the Namespace. Must be valid XML namespace prefix, i.e. match [a-z0-9]+."
"65","3","16","description",,,"true","false","false","false","false","true","false","Friendly human-readable description of the Namespace."
"66","4","4","type",,,"true","false","true","false","false","false","false","The Type of the Object itself."
"67","4","3","namespace",,,"true","false","true","false","false","false","false","The namespace this Type belongs to."
"68","4","4","super",,,"true","false","true","false","false","false","false","The supertype of this Type. It inherits all possible Links from its supertype."
"69","4","44","name",,,"true","false","true","false","false","false","false","The name of the Type. Should be unique within a namespace."
"70","4","16","description",,,"true","false","false","false","false","true","false","Friendly human-readable description of the Type."
"72","71","4","subject",,,"true","false","true","false","false","false","false","The object this fact is about."
"73","71","53","link",,,"true","false","true","false","false","false","false","The kind of fact this is, defined by the kind of Link."
"75","74","4","target",,,"false","false","true","false","false","false","false","The target object of this link fact."
"77","76","7","toggle",,,"true","false","true","false","true","true","false","Whether the specific toggle is set or not for this Object."
`;

export function parseNamespaceData(data: any): TlmNamespace[] {
  const result = [];
  for (const row of data) {
    const { oid, prefix, uri, description } = row;
    result.push(new TlmNamespace(oid, prefix, uri, description));
  }
  return result;
}

export function parseTypeData(data: any): TlmType[] {
  const result = [];
  for (const row of data) {
    const { oid, namespace, name, super_type, description } = row;
    const type = new TlmType({
      oid,
      namespace,
      name,
      superType: super_type,
      description,
    });
    result.push(type);
  }
  return result;
}

export function parseLinkData(data: any): TlmLink[] {
  const result = [];
  for (const row of data) {
    const {
      oid,
      from_type: fromType,
      to_type: toType,
      name,
      from_name: fromName,
      to_name: toName,
      is_singular_from: isSingular,
      is_singular_to: isSingularTo,
      is_mandatory_from: isMandatory,
      is_mandatory_to: isMandatoryTo,
      is_toggle: isToggle,
      is_value: isValue,
      is_primary_id: isPrimaryId,
      description,
    } = row;
    const link = new TlmLink({
      oid,
      fromType,
      toType,
      name,
      fromName,
      toName,
      isSingular,
      isSingularTo,
      isMandatory,
      isMandatoryTo,
      isToggle,
      isValue,
      isPrimaryId,
      description,
    });
    result.push(link);
  }
  return result;
}

export const TLM_CORE_NAMESPACES: TlmNamespace[] = [];
export const TLM_CORE_TYPES: TlmType[] = [];
export const TLM_CORE_LINKS: TlmLink[] = [];

let initialized = false;

export function loadCoreSchema(): void {
  if (initialized) {
    return;
  }
  initialized = true;

  // parsing takes about 10ms, so we do it lazily

  const namespaceData = parse(NAMESPACE_DATA, CSV_OPTIONS);
  const namespaces = parseNamespaceData(namespaceData);
  for (const ns of namespaces) {
    TLM_CORE_NAMESPACES.push(ns);
  }

  const typesData = parse(TYPES_DATA, CSV_OPTIONS);
  const types = parseTypeData(typesData);
  for (const t of types) {
    TLM_CORE_TYPES.push(t);
  }

  const linksData = parse(LINKS_DATA, CSV_OPTIONS);
  const links = parseLinkData(linksData);
  for (const l of links) {
    TLM_CORE_LINKS.push(l);
  }
}
