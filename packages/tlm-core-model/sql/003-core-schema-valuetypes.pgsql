BEGIN;
INSERT INTO tlm__schema_history (description) VALUES ('TLM Core Schema: Data Types');

-- a ValueType is a simple Object that's just a value.
-- It is represented as a column value or a value table.
CALL tlm__insert_type('tlm', 'ValueType', 'tlm', 'Type',
  'Simple kind of Object that is a simple primitive value.');

-- TODO: should add all XML ValueTypes here

-- a DataType is a ValueType from XML Schema.
CALL tlm__insert_type('xdt', 'DataType', 'tlm', 'ValueType',
  'An XML Schema DataType compatible value.');

-- a String is a DataType that's a primitive text value.
CALL tlm__insert_type('xdt', 'string', 'xdt', 'DataType',
  'A primitive text value.');

-- an Integer is a kind of decimal number that doesn't allow fractions.
CALL tlm__insert_type('xdt', 'integer', 'xdt', 'DataType',
  'A primitive integer value.');

-- a Boolean is either True or False.
CALL tlm__insert_type('xdt', 'boolean', 'xdt', 'DataType',
  'A primitive boolean value.');

-- a ID is a String that's used as an identifier.
-- TODO should inherit NCName
CALL tlm__insert_type('xdt', 'ID', 'xdt', 'DataType',
  'A string identifier.');

-- a UUID is an ID that's a globally unique identifier following RFC 4122.
CALL tlm__insert_type('tlm', 'UUID', 'xdt', 'ID',
  'A universally unique string identifier.');

-- a UUID is an ID that's a globally unique identifier following RFC 4122.
CALL tlm__insert_type('xdt', 'datetime', 'xdt', 'DataType',
  'A point in time.');

COMMIT;
