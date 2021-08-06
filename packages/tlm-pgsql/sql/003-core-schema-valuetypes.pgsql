BEGIN;
INSERT INTO tlm__schema_history (description)
VALUES ('TLM Core Schema: Data Types');

-- a ValueType is a simple Object that's just a value.
-- It is represented as a column value or a value table.
CALL tlm__insert_type('tlm', 'ValueType', 'tlm', 'Type',
                      'Simple kind of Object that is a simple primitive value.');

-- a DataType is a ValueType from XML Schema.
CALL tlm__insert_type('xs', 'DataType', 'tlm', 'ValueType',
                      'XML Schema compatible value.');

-- boolean
CALL tlm__insert_type('xs', 'boolean', 'xs', 'DataType',
                      'XML Schema compatible boolean.');

-- basic numbers
CALL tlm__insert_type('xs', 'float', 'xs', 'DataType',
                      'XML Schema compatible float.');
CALL tlm__insert_type('xs', 'double', 'xs', 'DataType',
                      'XML Schema compatible double.');
CALL tlm__insert_type('xs', 'decimal', 'xs', 'DataType',
                      'XML Schema compatible decimal.');
CALL tlm__insert_type('xs', 'integer', 'xs', 'decimal',
                      'XML Schema compatible integer.');
CALL tlm__insert_type('xs', 'long', 'xs', 'integer',
                      'XML Schema compatible long.');
CALL tlm__insert_type('xs', 'int', 'xs', 'long',
                      'XML Schema compatible int.');
CALL tlm__insert_type('xs', 'short', 'xs', 'int',
                      'XML Schema compatible short.');
CALL tlm__insert_type('xs', 'byte', 'xs', 'short',
                      'XML Schema compatible byte.');

-- basic string
CALL tlm__insert_type('xs', 'string', 'xs', 'DataType',
                      'XML Schema compatible string.');

-- basic IRI
CALL tlm__insert_type('xs', 'anyURI', 'xs', 'DataType',
                      'XML Schema compatible anyURI.');

-- basic date/time/duration
CALL tlm__insert_type('xs', 'duration', 'xs', 'DataType',
                      'XML Schema compatible duration.');
CALL tlm__insert_type('xs', 'dateTime', 'xs', 'DataType',
                      'XML Schema compatible dateTime.');
CALL tlm__insert_type('xs', 'time', 'xs', 'DataType',
                      'XML Schema compatible time.');
CALL tlm__insert_type('xs', 'date', 'xs', 'DataType',
                      'XML Schema compatible date.');
CALL tlm__insert_type('xs', 'gYearMonth', 'xs', 'DataType',
                      'XML Schema compatible date.');
CALL tlm__insert_type('xs', 'gYear', 'xs', 'DataType',
                      'XML Schema compatible gYear.');
CALL tlm__insert_type('xs', 'gMonthDay', 'xs', 'DataType',
                      'XML Schema compatible gMonthDay.');
CALL tlm__insert_type('xs', 'gDay', 'xs', 'DataType',
                      'XML Schema compatible gDay.');
CALL tlm__insert_type('xs', 'gMonth', 'xs', 'DataType',
                      'XML Schema compatible gMonth.');
CALL tlm__insert_type('xs', 'dateTimeStamp', 'xs', 'dateTime',
                      'XML Schema compatible dateTimeStamp.'); -- XSD 1.1
CALL tlm__insert_type('xs', 'dayTimeDuration', 'xs', 'duration',
                      'XML Schema compatible dayTimeDuration.'); -- XSD 1.1
CALL tlm__insert_type('xs', 'yearMonthDuration', 'xs', 'duration',
                      'XML Schema compatible yearMonthDuration.');
-- XSD 1.1

-- basic binary
CALL tlm__insert_type('xs', 'base64Binary', 'xs', 'DataType',
                      'XML Schema compatible base64Binary.');
CALL tlm__insert_type('xs', 'hexBinary', 'xs', 'DataType',
                      'XML Schema compatible hexBinary.');

-- constrained numbers
CALL tlm__insert_type('xs', 'nonPositiveInteger', 'xs', 'integer',
                      'XML Schema compatible nonPositiveInteger.');
CALL tlm__insert_type('xs', 'negativeInteger', 'xs', 'nonPositiveInteger',
                      'XML Schema compatible negativeInteger.');
CALL tlm__insert_type('xs', 'nonNegativeInteger', 'xs', 'integer',
                      'XML Schema compatible nonNegativeInteger.');
CALL tlm__insert_type('xs', 'positiveInteger', 'xs', 'nonNegativeInteger',
                      'XML Schema compatible positiveInteger.');
CALL tlm__insert_type('xs', 'unsignedLong', 'xs', 'nonNegativeInteger',
                      'XML Schema compatible unsignedLong.');
CALL tlm__insert_type('xs', 'unsignedInt', 'xs', 'unsignedLong',
                      'XML Schema compatible unsignedInt.');
CALL tlm__insert_type('xs', 'unsignedShort', 'xs', 'unsignedInt',
                      'XML Schema compatible unsignedShort.'); -- XSD 1.1
CALL tlm__insert_type('xs', 'unsignedByte', 'xs', 'unsignedShort',
                      'XML Schema compatible unsignedByte.');
-- XSD 1.1

-- constrained strings
CALL tlm__insert_type('xs', 'normalizedString', 'xs', 'string',
                      'XML Schema compatible normalizedString.');
CALL tlm__insert_type('xs', 'token', 'xs', 'normalizedString',
                      'XML Schema compatible token.');
CALL tlm__insert_type('xs', 'language', 'xs', 'token',
                      'XML Schema compatible language.');
CALL tlm__insert_type('xs', 'NMTOKEN', 'xs', 'token',
                      'XML Schema compatible NMTOKEN.');
CALL tlm__insert_type('xs', 'Name', 'xs', 'token',
                      'XML Schema compatible Name.');
CALL tlm__insert_type('xs', 'NCName', 'xs', 'Name',
                      'XML Schema compatible NCName.');
CALL tlm__insert_type('xs', 'IDREF', 'xs', 'NCName',
                      'XML Schema compatible IDREF.');
CALL tlm__insert_type('xs', 'ID', 'xs', 'NCName',
                      'XML Schema compatible ID.');
CALL tlm__insert_type('xs', 'ENTITY', 'xs', 'NCName',
                      'XML Schema compatible ENTITY.');

-- unique identifiers
CALL tlm__insert_type('tlm', 'URI', 'xs', 'anyURI',
                      'An ASCII uniform resource identifier per RFC3986.');
CALL tlm__insert_type('tlm', 'URL', 'tlm', 'URI',
                      'An ASCII uniform resource locator per WHATWG URL Standard.');
CALL tlm__insert_type('tlm', 'URN', 'tlm', 'URI',
                      'An ASCII uniforn resource name per RFC8141.');
CALL tlm__insert_type('tlm', 'UUID', 'tlm', 'URN',
                      'An ASCII universally unique identifier per RFC4122.');

COMMIT;
