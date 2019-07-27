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
CREATE TYPE object AS (oid INTEGER, type VARCHAR);

CREATE FUNCTION current_oid()
  RETURNS BIGINT
  LANGUAGE sql
  STABLE
  AS $$
      SELECT currval(pg_get_serial_sequence('objects', 'oid'))
$$;

CREATE PROCEDURE create_object(object_type INTEGER)
  LANGUAGE sql
  AS $$
    INSERT INTO objects (type) values (object_type);
$$;

-- a Namespace is a special Object that groups Types
CREATE TABLE namespaces (
  oid     INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  prefix  VARCHAR NOT NULL UNIQUE,
  uri     VARCHAR NOT NULL UNIQUE,
  description TEXT DEFAULT NULL
);
CREATE TYPE namespace AS (
  oid INTEGER,
  prefix VARCHAR,
  uri VARCHAR,
  description TEXT
);

CREATE FUNCTION select_ns_oid(ns_prefix VARCHAR)
  RETURNS INTEGER
  LANGUAGE sql
  STABLE
  AS $$
      SELECT oid FROM namespaces
        WHERE prefix = ns_prefix
        LIMIT 1
$$;

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
CREATE TYPE "type" AS (
  oid INTEGER,
  namespace INTEGER,
  name VARCHAR,
  super INTEGER,
  description TEXT
);

CREATE FUNCTION select_type_oid(type_name VARCHAR)
  RETURNS INTEGER
  LANGUAGE sql
  STABLE
  AS $$
      SELECT oid FROM types
        WHERE name = type_name
        LIMIT 1
$$;
CREATE FUNCTION select_type_oid(type_ns VARCHAR, type_name VARCHAR)
  RETURNS INTEGER
  LANGUAGE sql
  STABLE
  AS $$
      SELECT oid FROM types
        WHERE name = type_name
        AND namespace = select_ns_oid(type_ns)
        LIMIT 1
$$;

CREATE PROCEDURE create_object(type_ns VARCHAR, type_name VARCHAR)
  LANGUAGE sql
  AS $$
    INSERT INTO objects (type) values (select_type_oid(type_ns, type_name));
$$;

-- define the tlm namespace
INSERT INTO objects DEFAULT VALUES;
INSERT INTO namespaces (oid, prefix, uri, description) VALUES
  (
    current_oid(),
    'tlm',
    'https://type.link.model.tools/ns/tlm/',
    'The Core TLM namespace.'
  );

-- define the xdt namespace
INSERT INTO objects DEFAULT VALUES;
INSERT INTO namespaces (oid, prefix, uri, description) VALUES
  (
    current_oid(),
    'xdt',
    'https://www.w3.org/TR/xmlschema-2/',
    'Namespaces for XML Schema DataTypes.'
  );

-- define the Namespace type
INSERT INTO objects DEFAULT VALUES;
INSERT INTO types (oid, namespace, name, description) VALUES
  (
    current_oid(),
    select_ns_oid('tlm'),
    'Namespace',
    'The special Type for Namespaces.'
  );
-- update the objects for the namespaces to be of type Namespace
UPDATE objects
    SET type = select_type_oid('Namespace')
    WHERE oid = select_ns_oid('tlm');
UPDATE objects
    SET type = select_type_oid('Namespace')
    WHERE oid = select_ns_oid('xdt');

INSERT INTO objects DEFAULT VALUES;
INSERT INTO types (oid, namespace, name, description) VALUES
  (
    current_oid(),
    select_ns_oid('tlm'),
    'Type',
    'The special Type for Types (the meta-Type).'
  );
-- update the namespace types to have the Type type as its supertype
UPDATE types
    SET super = select_type_oid('tlm', 'Type')
    WHERE oid = select_type_oid('tlm', 'Namespace');
-- update the object for the Namespace type to be of type Type
UPDATE objects
    SET type  = select_type_oid('tlm', 'Type')
    WHERE oid = select_type_oid('tlm', 'Namespace');
-- update the type type to have the Type type as its supertype
UPDATE types
    SET super = select_type_oid('tlm', 'Type')
    WHERE oid = select_type_oid('tlm', 'Type');
-- update the object for the Type type to be of type Type
UPDATE objects
    SET type  = select_type_oid('tlm', 'Type')
    WHERE oid = select_type_oid('tlm', 'Type');

-- require objects to have a type (which we can do now the Type type exists)
ALTER TABLE objects
  ALTER COLUMN "type" SET NOT NULL,
  ADD CONSTRAINT objects_type_fkey
    FOREIGN KEY ("type")
    REFERENCES types (oid);
-- requires types to have a sypertype (which we can do now the Type type exists)
ALTER TABLE types
  ALTER COLUMN "super" SET NOT NULL;

CREATE PROCEDURE register_type (
  ns           VARCHAR,
  name         VARCHAR,
  super_ns     VARCHAR,
  super        VARCHAR,
  description  VARCHAR
) LANGUAGE SQL AS $$
    CALL create_object('tlm', 'Type');
    INSERT INTO types (oid, namespace, name, super, description) VALUES
      (
        current_oid(),
        select_ns_oid(ns),
        name,
        select_type_oid(super_ns, super),
        description
      );
$$;

CREATE PROCEDURE create_namespace(prefix VARCHAR, uri VARCHAR, description TEXT)
  LANGUAGE sql
  AS $$
    CALL create_object('tlm', 'Namespace');
    INSERT INTO namespaces (oid, prefix, uri, description) VALUES
      (current_oid(), prefix, uri, description);
$$;

-- a ValueType is a simple Object that's just a value.
-- It is represented as a column value or a value table.
CALL register_type('tlm', 'ValueType', 'tlm', 'Type',
  'Simple kind of Object that is a simple primitive value.');

-- a DataType is a ValueType from XML Schema.
CALL register_type('xdt', 'DataType', 'tlm', 'ValueType',
  'An XML Schema DataType compatible value.');

-- a String is a DataType that's a primitive text value.
CALL register_type('xdt', 'string', 'xdt', 'DataType',
  'A primitive text value.');

-- an Integer is a kind of decimal number that doesn't allow fractions.
CALL register_type('xdt', 'integer', 'xdt', 'DataType',
  'A primitive integer value.');

-- a Boolean is either True or False.
CALL register_type('xdt', 'boolean', 'xdt', 'DataType',
  'A primitive boolean value.');

-- a ID is a String that's used as an identifier.
-- TODO should inherit NCName
CALL register_type('xdt', 'ID', 'xdt', 'DataType',
  'A string identifier.');

-- TODO: should add all XML ValueTypes here

-- a UUID is an ID that's a globally unique identifier following RFC 4122.
CALL register_type('tlm', 'UUID', 'xdt', 'ID',
  'A universally unique string identifier.');

---
--- Done with Type, Namespace, built-in ValueTypes, move on to links...
---

CREATE TABLE links (
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
  is_singular    BOOLEAN NOT NULL DEFAULT FALSE,
  is_mandatory   BOOLEAN NOT NULL DEFAULT FALSE,
  is_toggle      BOOLEAN NOT NULL DEFAULT FALSE,
  is_value       BOOLEAN NOT NULL DEFAULT FALSE,
  is_primary_id  BOOLEAN NOT NULL DEFAULT FALSE,
  description    TEXT DEFAULT NULL

  -- todo check is_toggle != is_value
  -- todo check is_toggle means is_mandatory
);

CALL register_type('tlm', 'Link', 'tlm', 'Type',
  'A relation between types.');

CREATE PROCEDURE create_link (
  from_type_name  VARCHAR,
  from_type_ns    VARCHAR,
  link_name       VARCHAR,
  to_type_name    VARCHAR,
  to_type_ns      VARCHAR,
  from_name       VARCHAR DEFAULT NULL,
  to_name         VARCHAR DEFAULT NULL,
  is_singular     BOOLEAN DEFAULT FALSE,
  is_mandatory    BOOLEAN DEFAULT FALSE,
  is_toggle       BOOLEAN DEFAULT FALSE,
  is_value        BOOLEAN DEFAULT FALSE,
  is_primary_id   BOOLEAN DEFAULT FALSE,
  description     TEXT DEFAULT NULL
) LANGUAGE SQL AS $$
    INSERT INTO objects (type) values (select_type_oid('tlm', 'Link'));
    INSERT INTO links
      (
        oid,
        from_type,
        to_type,
        name,
        from_name,
        to_name,
        is_singular,
        is_mandatory,
        is_value,
        is_primary_id,
        description
      ) VALUES (
        current_oid(),
        select_type_oid(from_type_ns, from_type_name),
        select_type_oid(to_type_ns, to_type_name),
        link_name,
        from_name,
        to_name,
        is_singular,
        is_mandatory,
        is_value,
        is_primary_id,
        description
      );
$$;

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Namespace',
  link_name      => 'prefix',
  to_type_ns     => 'xdt',
  to_type_name   => 'string',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  is_value       => TRUE,
  description    => 'Shorthand identifier for the Namespace. Must be valid XML namespace prefix, i.e. match [a-z0-9]+.'
);

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Namespace',
  link_name      => 'description',
  to_type_ns     => 'xdt',
  to_type_name   => 'string',
  is_singular    => TRUE,
  is_value       => TRUE,
  description    => 'Friendly human-readable description of the Namespace.'
);

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'type',
  to_type_ns     => 'tlm',
  to_type_name   => 'Type',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The Type of the Object itself.'
);

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'namespace',
  to_type_ns     => 'tlm',
  to_type_name   => 'Namespace',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The namespace this Type belongs to.'
);

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'super',
  to_type_ns     => 'tlm',
  to_type_name   => 'Type',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The supertype of this Type. It inherits all possible Links from its supertype.'
);

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'name',
  to_type_ns     => 'xdt',
  to_type_name   => 'string',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The name of the Type. Should be unique within a namespace.'
);

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'description',
  to_type_ns     => 'xdt',
  to_type_name   => 'string',
  is_singular    => TRUE,
  is_value       => TRUE,
  description    => 'Friendly human-readable description of the Type.'
);

CREATE TABLE resolvers (
  oid     INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  prefix  VARCHAR NOT NULL,
  url     VARCHAR NOT NULL,

  UNIQUE (prefix, url)
);

CREATE TYPE resolver AS (
  oid INTEGER,
  prefix VARCHAR,
  url VARCHAR
);

CALL register_type('tlm', 'Resolver', 'tlm', 'Type',
  'Can map URIs to URLs. Should implement I2Ls from RFC2483.');

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Resolver',
  link_name      => 'prefix',
  to_type_ns     => 'xdt',
  to_type_name   => 'string',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  is_value       => TRUE,
  description    => 'Shorthand identifier for the Namespace this resolver Resolves. Must be valid XML namespace prefix, i.e. match [a-z0-9]+.'
);

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Resolver',
  link_name      => 'url',
  to_type_ns     => 'xdt',
  to_type_name   => 'string',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  is_value       => TRUE,
  description    => 'Valid URL for this resolver.'
);

CREATE TABLE facts (
  oid            INTEGER PRIMARY KEY
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  subject        INTEGER NOT NULL
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  link           INTEGER NOT NULL
      REFERENCES links (oid)
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
  value_type     INTEGER NOT NULL
      REFERENCES types (oid)
);

CREATE TABLE sets ( -- extends facts
  oid            INTEGER
      REFERENCES facts (oid)
      ON DELETE CASCADE,
  target         INTEGER NOT NULL
      REFERENCES objects (oid)
      ON DELETE CASCADE,
  
  PRIMARY KEY (oid, target)
);


CALL register_type('tlm', 'Fact', 'tlm', 'Type',
  'A statement about an identified Object in the world considered to be true.');

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Fact',
  link_name      => 'subject',
  to_type_ns     => 'tlm',
  to_type_name   => 'Type',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The object this fact is about.'
);

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Fact',
  link_name      => 'link',
  to_type_ns     => 'tlm',
  to_type_name   => 'Link',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The kind of fact this is, defined by the kind of Link.'
);

CALL register_type('tlm', 'LinkFact', 'tlm', 'Fact',
  'A fact about an object its relation to another object.');

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'LinkFact',
  link_name      => 'target',
  to_type_ns     => 'tlm',
  to_type_name   => 'Type',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The target object of this link fact.'
);

CALL register_type('tlm', 'ToggleFact', 'tlm', 'Fact',
  'A fact about an object that is either true (defined) or false (absent).');

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'ToggleFact',
  link_name      => 'toggle',
  to_type_ns     => 'xdt',
  to_type_name   => 'boolean',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  is_value       => TRUE,
  description    => 'Whether the specific toggle is set or not for this Object.'
);

CALL register_type('tlm', 'ValueFact', 'tlm', 'Fact',
  'A fact about an object that relates to a primitive value.');

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'ValueFact',
  link_name      => 'value',
  to_type_ns     => 'tlm',
  to_type_name   => 'ValueType',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  is_value       => TRUE,
  description    => 'The value for this Object.'
);

CALL register_type('tlm', 'Set', 'tlm', 'Fact',
  'A collection of facts for an object for a particular kind of Link.');

CALL create_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Set',
  link_name      => 'target',
  to_type_ns     => 'tlm',
  to_type_name   => 'Type',
  description    => 'A target object of this link fact.'
);

-- done with core schema
INSERT INTO schema_history (description) VALUES ('TLM Core Schema');

-- looking at the result...
CREATE FUNCTION select_tlm_schema(max_description INTEGER DEFAULT 20)
  RETURNS TABLE (
    oid INTEGER,
    object_type VARCHAR,
    ns_prefix VARCHAR,
    type_name VARCHAR,
    parent_type VARCHAR,
    link_from VARCHAR,
    link_name VARCHAR,
    link_to VARCHAR,
    s BOOLEAN,
    m BOOLEAN,
    v BOOLEAN,
    t BOOLEAN,
    description TEXT
  )
  LANGUAGE sql
  AS $$
    SELECT
        DISTINCT(o.oid) AS oid,
        CONCAT(t_n.prefix, ':', t.name) AS object_type,
        n.prefix AS ns_prefix,
        CASE WHEN t2.name IS NULL THEN NULL
            ELSE CONCAT(t2_n.prefix, ':', t2.name)
        END AS type_name,
        CASE WHEN t3.name IS NULL THEN NULL
            ELSE CONCAT(t3_n.prefix, ':', t3.name)
        END AS parent_type,
        CASE WHEN l_from.name IS NULL THEN NULL
            ELSE CONCAT(l_from_n.prefix, ':', l_from.name)
        END AS link_from,
        l.name link_name,
        CASE WHEN l_to.name IS NULL THEN NULL
            ELSE CONCAT(l_to_n.prefix, ':', l_to.name)
        END AS link_to,
        l.is_singular AS s,
        l.is_mandatory As m,
        l.is_value As v,
        l.is_toggle AS t,
        CASE WHEN t2.name IS NOT NULL THEN substring(t2.description from 0 for max_description)
            WHEN n.prefix IS NOT NULL THEN substring(n.description from 0 for max_description)
            WHEN l.name IS NOT NULL THEN substring(l.description from 0 for max_description)
            ELSE NULL
        END AS description
      FROM objects o
      LEFT OUTER JOIN types t              ON o.type = t.oid
      LEFT OUTER JOIN namespaces t_n       ON t.namespace = t_n.oid

      LEFT OUTER JOIN namespaces n         ON o.oid = n.oid

      LEFT OUTER JOIN types t2             ON o.oid = t2.oid
      LEFT OUTER JOIN namespaces t2_n      ON t2.namespace = t2_n.oid
      LEFT OUTER JOIN types t3             ON t2.super = t3.oid
      LEFT OUTER JOIN namespaces t3_n      ON t3.namespace = t3_n.oid

      LEFT OUTER JOIN links l              ON l.oid = o.oid
      LEFT OUTER JOIN types l_from         ON l.from_type = l_from.oid
      LEFT OUTER JOIN namespaces l_from_n  ON l_from.namespace = l_from_n.oid
      LEFT OUTER JOIN types l_to           ON l.to_type = l_to.oid
      LEFT OUTER JOIN namespaces l_to_n    ON l_to.namespace = l_to_n.oid

      WHERE o.type IN (
        select_type_oid('tlm', 'Namespace'),
        select_type_oid('tlm', 'Type'),
        select_type_oid('tlm', 'Link')
      )

      ORDER BY o.oid ASC;
$$;
SELECT * FROM select_tlm_schema(40);
