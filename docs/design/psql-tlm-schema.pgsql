-- TODO: PSQL functions/procedures to make this file less copy/pasty

-- basic table for managing schema migration
CREATE TABLE schema_history (
  version       SERIAL PRIMARY KEY,
  description   TEXT,
  installed_on  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

-- an Object is one instance of a Type
CREATE TABLE objects (
  oid     SERIAL PRIMARY KEY,
  "type"  INTEGER DEFAULT NULL
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
  -- super will become mandatory momentarily after the first type is defined
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
-- update the namespace type to have the Type type as its supertype
UPDATE types
    SET super = 
        (SELECT oid FROM types WHERE name = 'Type' LIMIT 1)
    WHERE oid =
        (SELECT oid FROM types WHERE name = 'Namespace' LIMIT 1);
-- update the object for the Namespace type to be of type Type
UPDATE objects
    SET type =
        (SELECT oid FROM types WHERE name = 'Type' LIMIT 1)
    WHERE oid =
        (SELECT oid FROM types WHERE name = 'Namespace' LIMIT 1);
-- update the type type to have the Type type as its supertype
UPDATE types
    SET super = 
        (SELECT oid FROM types WHERE name = 'Type' LIMIT 1)
    WHERE oid =
        (SELECT oid FROM types WHERE name = 'Type' LIMIT 1);
-- update the object for the Type type to be of type Type
UPDATE objects
    SET type =
        (SELECT oid FROM types WHERE name = 'Type' LIMIT 1)
    WHERE oid =
        (SELECT oid FROM types WHERE name = 'Type' LIMIT 1);

-- require objects to have a type (which we can do now the Type type exists)
ALTER TABLE objects
    ALTER COLUMN "type" SET NOT NULL,
    ADD CONSTRAINT objects_type_fkey FOREIGN KEY ("type") REFERENCES types (oid),
    ALTER COLUMN "supertype" SET NOT NULL;


CREATE PROCEDURE register_type (
  ns            VARCHAR,
  name          VARCHAR,
  supertype_ns  VARCHAR,
  supertype     VARCHAR,
  description   VARCHAR
) LANGUAGE SQL AS $$
    INSERT INTO objects (type) values
      ((SELECT oid FROM types WHERE
          name = 'Type'
          AND namespace = (SELECT oid FROM namespaces WHERE prefix = 'tlm' LIMIT 1)
        LIMIT 1));
    INSERT INTO types (oid, namespace, name, super, description) VALUES
      (
        (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
        (SELECT oid FROM namespaces WHERE prefix = ns LIMIT 1),
        name,
        (SELECT oid FROM types WHERE
          name = supertype
          AND namespace = (SELECT oid FROM namespaces WHERE prefix = supertype_ns LIMIT 1)
         LIMIT 1),
        description
      );
$$;

CALL register_type ('tlm', 'Resolver', 'tlm', 'Type',
  'Can map URIs to URLs. Should implement I2Ls from RFC2483.');
CREATE TABLE resolvers (
  oid     INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  prefix  VARCHAR NOT NULL,
  url     VARCHAR NOT NULL,

  UNIQUE (prefix, url)
);

-- A Link is _not_ an Object but a relation between them.
-- It is represented in SQL by a foreign key reference or
-- entry in a link table or a column value.
CALL register_type ('tlm', 'Link', 'tlm', 'Type',
  'Recording of a specific relation between two objects.');

-- A LinkDescription is an Object that further describes
-- metadata about a Link
CALL register_type ('tlm', 'LinkDescription', 'tlm', 'Type',
  'Description of the relation that is defined between two objects when a link exists.');
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

CREATE PROCEDURE create_link_description (
  from_type      VARCHAR,
  from_type_ns   VARCHAR,
  name           VARCHAR,
  to_type        VARCHAR,
  to_type_ns     VARCHAR,
  from_name      VARCHAR DEFAULT NULL,
  to_name        VARCHAR DEFAULT NULL,
  is_unique      BOOLEAN DEFAULT FALSE,
  is_mandatory   BOOLEAN DEFAULT FALSE,
  is_toggle      BOOLEAN DEFAULT FALSE,
  is_value       BOOLEAN DEFAULT FALSE,
  is_primary_id  BOOLEAN DEFAULT FALSE,
  description    TEXT DEFAULT NULL
) LANGUAGE SQL AS $$
    INSERT INTO objects (type) values
      ((SELECT oid FROM types WHERE
          name = 'LinkDescription'
          AND namespace = (SELECT oid FROM namespaces WHERE prefix = 'tlm' LIMIT 1)
        LIMIT 1));
    INSERT INTO link_descriptions
      (
        oid,
        from_type,
        to_type,
        name,
        from_name,
        to_name,
        is_unique,
        is_mandatory,
        is_value,
        is_primary_id,
        description
      ) VALUES (
        (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
        (SELECT oid FROM types WHERE
            name = from_type
            AND namespace = (SELECT oid FROM namespaces WHERE prefix = from_type_ns LIMIT 1)
         LIMIT 1),
        (SELECT oid FROM types WHERE
            name = to_type
            AND namespace = (SELECT oid FROM namespaces WHERE prefix = to_type_ns LIMIT 1)
         LIMIT 1),
        name,
        from_name,
        to_name,
        is_unique,
        is_mandatory,
        is_value,
        is_primary_id,
        description
      );
$$;

CALL create_link_description(
  from_type_ns  => 'tlm',
  from_type     => 'Namespace',
  name          => 'prefix',
  to_type_ns    => 'xd',
  to_type       => 'string'
  is_unique     => TRUE,
  is_mandatory  => TRUE,
  is_value      => TRUE,
  description   => 'Shorthand identifier for the Namespace. Must be valid XML namespace prefix, i.e. match [a-z0-9]+.'
);

CALL create_link_description(
  from_type_ns  => 'tlm',
  from_type     => 'Namespace',
  name          => 'description',
  to_type_ns    => 'xd',
  to_type       => 'string',
  is_value      => TRUE,
  description   => 'Friendly human-readable description of the Namespace.'
);

CALL create_link_description(
  from_type_ns  => 'tlm',
  from_type     => 'Type',
  name          => 'type',
  to_type_ns    => 'tlm',
  to_type       => 'Type',
  is_mandatory  => TRUE,
  description   => 'The Type of the Object itself.'
);

CALL create_link_description(
  from_type_ns  => 'tlm',
  from_type     => 'Type',
  name          => 'namespace',
  to_type_ns    => 'tlm',
  to_type       => 'Namespace',
  is_mandatory  => TRUE,
  description   => 'The namespace this Type belongs to.'
);

CALL create_link_description(
  from_type_ns  => 'tlm',
  from_type     => 'Type',
  name          => 'super',
  to_type_ns    => 'tlm',
  to_type       => 'Type',
  is_mandatory  => TRUE,
  description   => 'The supertype of this Type. It inherits all possible Links from its supertype.'
);

INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO link_descriptions
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
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
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
INSERT INTO link_descriptions
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
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM types WHERE name = 'Type'),
    'name',
    FALSE,  -- unique, only unique within namespace
    TRUE,   -- mandatory
    TRUE,   -- value
    'The name of the Type. Should be unique within a namespace.'
  );
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO link_descriptions (oid,from_type,name,is_unique,is_mandatory,is_value,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM types WHERE name = 'Type'),
    'description',
    TRUE,   -- unique
    FALSE,  -- mandatory
    TRUE,   -- value
    'Friendly human-readable description of the Type.'
  );

INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO link_descriptions (oid,from_type,name,is_unique,is_mandatory,is_value,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM types WHERE name = 'Resolver'),
    'prefix',
    FALSE,   -- unique
    TRUE,   -- mandatory
    TRUE,   -- value
    'Shorthand identifier for the Namespace this resolver Resolves. Must be valid XML namespace prefix, i.e. match [a-z0-9]+.'
  );
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'LinkDescription' LIMIT 1));
INSERT INTO link_descriptions (oid,from_type,name,is_unique,is_mandatory,is_value,description) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
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
INSERT INTO types (oid, namespace, name, description, super) VALUES
  (
    (SELECT currval(pg_get_serial_sequence('objects', 'oid'))),
    (SELECT oid FROM namespaces WHERE prefix = 'tlm'),
    'Set',
    'Description of a relation between multiple objects.',
    (SELECT oid FROM types WHERE name = 'Type' LIMIT 1)
  );

-- a ValueType is a simple Object that's just a value.
-- It is represented as a column value or a value table.
INSERT INTO objects (type) values
  ((SELECT oid FROM types WHERE name = 'Type' LIMIT 1));
INSERT INTO types (oid, namespace, name, description, super) VALUES
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
INSERT INTO types (oid, namespace, name, description, super) VALUES
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
INSERT INTO types (oid, namespace, name, description, super) VALUES
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
INSERT INTO types (oid, namespace, name, description, super) VALUES
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
INSERT INTO types (oid, namespace, name, description, super) VALUES
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
INSERT INTO types (oid, namespace, name, description, super) VALUES
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
      REFERENCES link_descriptions (oid)
      ON DELETE CASCADE
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
INSERT INTO schema_history (description) VALUES ('TLM Core Schema');