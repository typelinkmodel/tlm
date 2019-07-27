-- DROP DATABASE tlm;
-- CREATE DATABASE tlm
--     WITH TEMPLATE=template0
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'en_US.UTF-8'
--     LC_CTYPE = 'en_US.UTF-8';

-- TODO: PSQL functions/procedures to make this file less copy/pasty

-- basic table for managing schema migration
CREATE TABLE schema_history (
  version       SERIAL PRIMARY KEY,
  description   TEXT,
  installed_on  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

---
--- Namespace: TLM
---

-- an Object is one instance of a Type
CREATE TABLE objects (
  oid   SERIAL PRIMARY KEY,
  type  INTEGER DEFAULT NULL
  -- type will get its contraints momentarily after the Type type is defined
);

-- a Namespace is a special Object that groups Types
CREATE TABLE namespaces (
  oid     INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  prefix  VARCHAR NOT NULL UNIQUE,
  uri     VARCHAR NOT NULL UNIQUE,
  description TEXT DEFAULT NULL
);

-- a Type is a special Object that represents a class of Objects
CREATE TABLE types (
  oid        INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  namespace  INTEGER NOT NULL
      REFERENCES namespaces (oid)
      ON UPDATE CASCADE,
  name       VARCHAR NOT NULL,
  super      INTEGER DEFAULT NULL
      REFERENCES types (oid),
  description TEXT DEFAULT NULL,

  UNIQUE (namespace, name)
);

-- define the object for the tlm namespace
INSERT INTO objects DEFAULT VALUES;
-- define the tlm namespace
INSERT INTO namespaces (oid, prefix, uri, description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    'tlm',
    'https://type.link.model.tools/ns/tlm/',
    'The Core TLM namespace.'
  );

-- define the object for the Namespace type
INSERT INTO objects DEFAULT VALUES;
-- define the Namespace type
INSERT INTO types (oid, namespace, name, description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'tlm' LIMIT 1),
    'Namespace',
    'The special Type for Namespaces.'
  );
-- update the object for the tlm namespace to be of type Namespace
UPDATE objects
    SET type =
        (SELECT currval(pg_get_serial_sequence('objects', 'oid')))
    WHERE oid =
        (SELECT oid FROM namespaces WHERE prefix = 'tlm' LIMIT 1);

-- define the special object for the Type type
INSERT INTO objects DEFAULT VALUES;
-- define the Type type
INSERT INTO types (oid, namespace, name, description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'tlm'),
    'Type',
    'The special Type for Types (the meta-Type).'
  );
-- update the object for the Namespace type to be of type Type
UPDATE objects
    SET type =
        (SELECT oid FROM types WHERE name = 'Type' LIMIT 1)
    WHERE oid =
        (SELECT oid FROM types WHERE name = 'Namespace' LIMIT 1);
-- update the object for the Type type to be of type Type
UPDATE objects
    SET type =
        (SELECT oid FROM types WHERE name = 'Type' LIMIT 1)
    WHERE oid =
        (SELECT oid FROM types WHERE name = 'Type' LIMIT 1);

-- require objects to have a type (which we can do now the Type type exists)
ALTER TABLE objects
    MODIFY COLUMN type INTEGER NOT NULL
        REFERENCES types (oid);

-- a Resolver is a special Object that maps URIs to URLs
CREATE TABLE resolvers (
  oid     INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  prefix  VARCHAR NOT NULL,
  url     VARCHAR NOT NULL,

  UNIQUE (prefix, url)
);

-- define the Resolver Type
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'tlm'),
    'Resolver',
    'Can map URIs to URLs. Should implement I2Ls from RFC2483.'
  );

-- A Link is _not_ an Object but a relation between them.
-- It is represented in SQL by a foreign key reference or
-- entry in a link table or a column value.
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'tlm'),
    'Link',
    'Recording of a specific relation between two objects.'
  );

-- A LinkDescription is an Object that further describes
-- metadata about a Link
CREATE TABLE link_descriptions (
  oid            INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  from_type      INTEGER NOT NULL
      REFERENCES types (oid),
  to_type        INTEGER DEFAULT NULL
      REFERENCES types (oid),
  name           VARCHAR NOT NULL,
  from_name      VARCHAR DEFAULT NULL,
  to_name        VARCHAR DEFAULT NULL,
  is_unique      BOOLEAN NOT NULL DEFAULT FALSE,
  is_mandatory   BOOLEAN NOT NULL DEFAULT FALSE,
  is_toggle      BOOLEAN NOT NULL DEFAULT FALSE,
  is_value       BOOLEAN NOT NULL DEFAULT FALSE,
  is_primary_id  BOOLEAN NOT NULL DEFAULT FALSE,
  description    TEXT DEFAULT NULL

  -- todo check is_toggle != is_value
  -- todo check is_toggle means is_mandatory
);

-- define the LinkDescription Type
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'tlm'),
    'LinkDescription',
    'Description of the relation that is defined between two objects when a link exists.'
  );

-- LinkDescription instances for the core TLM namespace
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription (oid,from_type,name,is_unique,is_mandatory,is_value,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Namespace'),
    'prefix',
    TRUE,   -- unique
    TRUE,   -- mandatory
    TRUE,   -- value
    'Shorthand identifier for the Namespace. Must be valid XML namespace prefix, i.e. match [a-z0-9]+.'
  );
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription (oid,from_type,name,is_unique,is_mandatory,is_value,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Namespace'),
    'uri',
    TRUE,   -- unique
    TRUE,   -- mandatory
    TRUE,   -- value
    'Canonical uniform resource name of the Namespace. Must be valid URI.'
  );
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription (oid,from_type,name,is_unique,is_mandatory,is_value,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Namespace'),
    'description',
    TRUE,   -- unique
    FALSE,  -- mandatory
    TRUE,   -- value
    'Friendly human-readable description of the Namespace.'
  );

INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription (oid,from_type,name,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Type'),
    'type',
    'The Type of the Object itself.'
  );
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription
  (
    oid,
    from_type,
    to_type,
    name,
    is_unique,
    is_mandatory,
    is_value,
    description
  )
  VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Type'),  -- from
    (SELECT oid FROM types WHERE name = 'Namespace'),  -- to
    'namespace',
    TRUE,   -- unique
    TRUE,   -- mandatory
    FALSE,  -- value
    'The namespace this Type belongs to.'
  );
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription
  (
    oid,
    from_type,
    to_type,
    name,
    is_unique,
    is_mandatory,
    is_value,
    description
  )
  VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Type'),  -- from
    (SELECT oid FROM types WHERE name = 'Type'),  -- to
    'super',
    TRUE,   -- unique
    FALSE,  -- mandatory
    FALSE,  -- value
    'The supertype of this Type. It inherits all possible Links from its supertype.'
  );
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription
  (
    oid,
    from_type,
    name,
    is_unique,
    is_mandatory,
    is_value,
    description
  )
  VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Type'),
    'name',
    FALSE,  -- unique, only unique within namespace
    TRUE,   -- mandatory
    TRUE,   -- value
    'The name of the Type. Should be unique within a namespace.'
  );
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription (oid,from_type,name,is_unique,is_mandatory,is_value,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Type'),
    'description',
    TRUE,   -- unique
    FALSE,  -- mandatory
    TRUE,   -- value
    'Friendly human-readable description of the Type.'
  );

INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription (oid,from_type,name,is_unique,is_mandatory,is_value,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Resolver'),
    'prefix',
    FALSE,   -- unique
    TRUE,   -- mandatory
    TRUE,   -- value
    'Shorthand identifier for the Namespace this resolver Resolves. Must be valid XML namespace prefix, i.e. match [a-z0-9]+.'
  );
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO LinkDescription (oid,from_type,name,is_unique,is_mandatory,is_value,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid')),
    (SELECT oid FROM types WHERE name = 'Resolver'),
    'url',
    FALSE,  -- unique
    TRUE,   -- mandatory
    TRUE,   -- value
    'Valid URL for this resolver.'
  );

-- A Set is _not_ an Object but a collection of Links,
-- from one Object to multiple other Objects.
-- It is not represented in SQL directly, rather it takes
-- the form of multiple entries in a link table.
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'tlm'),
    'Link',
    'Description of a relation between multiple objects.'
  );

-- a ValueType is a simple Object that's just a value.
-- It is represented as a column value or a value table.
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, super) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'tlm'),
    'ValueType',
    'Simple kind of Object that is a simple primitive value. Should match an XML Schema ValueType.',
    (SELECT oid FROM types WHERE name = 'Type' LIMIT 1)
  );

-- define the message namespace
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Namespace' LIMIT 1));
INSERT INTO namespaces (oid, prefix, uri, description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    'xd',
    'https://www.w3.org/TR/xmlschema-2/',
    'Namespaces for XML Schema DataTypes.'
  );

-- a DataType is a ValueType from XML Schema.
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, super) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'xd'),
    'DataType',
    'An XML Schema DataType compatible value.',
    (SELECT oid FROM types WHERE name = 'ValueType' LIMIT 1)
  );

-- a String is a DataType that's a primitive text value.
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, super) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'xd'),
    'string',
    'A primitive text value.',
    (SELECT oid FROM types WHERE name = 'DataType' LIMIT 1)
  );

-- an Integer is a kind of decimal number that doesn't allow fractions.
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, super) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'xd'),
    'integer',
    'A primitive integer value.',
    (SELECT oid FROM types WHERE name = 'DataType' LIMIT 1)
  );

-- a ID is a String that's used as an identifier.
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, super) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'xd'),
    'ID',
    'A string identifier.',
    -- TODO should inherit NCName
    (SELECT oid FROM types WHERE name = 'string' LIMIT 1)
  );

-- TODO: should add all XML ValueTypes here

-- a UUID is an ID that's a globally unique identifier following RFC 4122.
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, super) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'tlm'),
    'UUID',
    'A unique identifier.',
    (SELECT oid FROM types WHERE name = 'ID' LIMIT 1)
  );

-- a Fact is a statement about an identified Object in the world
CREATE TABLE facts (
  oid            INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  subject        INTEGER NOT NULL
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  predicate      INTEGER NOT NULL
      REFERENCES links (oid)
      ON DELETE CASCADE,
);

CREATE TABLE link_facts ( -- extends facts
  oid            INTEGER PRIMARY KEY
      REFERENCES facts (oid)
      ON DELETE CASCADE,
  target         INTEGER NOT NULL
      REFERENCES objects (oid)
      ON DELETE CASCADE
);

CREATE TABLE toggle_facts ( -- extends facts
  oid            INTEGER PRIMARY KEY
      REFERENCES facts (oid)
      ON DELETE CASCADE,
  toggle         BOOLEAN NOT NULL
);

CREATE TABLE value_facts ( -- extends facts
  oid            INTEGER PRIMARY KEY
      REFERENCES facts (oid)
      ON DELETE CASCADE,
  value          TEXT DEFAULT NULL,
  value_type     INTEGER DEFAULT NULL
      REFERENCES types (oid)
);

-- done with core schema
INSERT INTO schema_history (description) VALUES
    ('TLM Core Schema');

---
--- Namespace: MESSAGE
---

-- define the message namespace
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Namespace' LIMIT 1));
INSERT INTO namespaces (oid, prefix, uri, description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    'message',
    'https://type.link.model.tools/ns/message/',
    'Namespaces defining how to pass messages between systems.'
  );

-- a Message is an Object which is about another object
CREATE TABLE messages (
  oid          INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  id           VARCHAR NOT NULL UNIQUE,
  subject      INTEGER NOT NULL
      REFERENCES facts (oid),
);

INSERT INTO schema_history (description) VALUES
    ('TLM Message Schema');
