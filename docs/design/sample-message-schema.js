const sample = {
    "namespaces": {
        // defines prefixes (like in XML) to use in the rest of
        // the document for references to model definitions
        "tlm": "https://type.link.model.tools/ns/tlm/",
        "prefix1": "https://..../..../....1",
        "prefix2": "https://..../..../....2",
        // ...
        "prefixN": "https://..../..../....N",
        "default": "tlm"
    },
    // every object has to have a type, they are of that type
    // types exist in a namespace
    "type": "prefix1:myMainType",
    
    // objects can have at most one ID, which should be globally unique
    // it is better to not have an ID than to have a non-unique ID
    // ideally the ID is a URI using a well-known scheme
    // ideally the ID is a business key that means something in a domain
    // when no business key can be used, UUIDs are a good choice
    "id": "urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e",

    // besides a "type" and an "id", objects that are not of a value type
    // have 0 or more links to other objects
    // links exist in a namespace
    // links are represented in json as object key pointing to nested object:
    "prefix2:someLink": {
        // nested objects have the same structure
        "type": "prefix2:SomeType",
        "id": "mailto:leo@example.com",
        "name": {
            // value type objects do not have an id and do not have links
            // instead they have exactly one value
            // null is not a valid value, instead the parent link should be absent
            "type": "String",
            "value": "Leo Simons"
        },
        "prefix2:someOtherLink": {
            // arbitrary inline nesting of objects is allowed
            // but objects cannot appear twice
            // instead use references
            "id": "mailto:simon@example.com",
            "type": "hr:Person",
            "name": {
                "type": "String",
                "value": "Simon Lucy"
            },
            "prefix3:linkInverse": {
                // an inline reference (ref) is to an object defined elsewhere in the document
                // inline references to things that are not found in the document are illegal
                "type": "ref",
                "id": "mailto:leo@example.com"
            },
            "prefix4:remoteLink": {
                // remote reference (rref) is to an object not defined in the document
                "type": "href",
                "id": "mailto:dirkx@example.com",
                "name": {
                    "type": "String",
                    "value": "Dirk van Gulik"
                },
                // a hyperlink reference (href) is a remote reference with a URL for that object
                "href": {
                    "type": "URL",
                    "value": "https://example.com/hr/Person/mailto:dirkx@example.com"
                }
            }
        }
    },
    "prefix2:yetAnOtherLink": {
        "type": "prefix2:SomeOtherType"
    }
};
