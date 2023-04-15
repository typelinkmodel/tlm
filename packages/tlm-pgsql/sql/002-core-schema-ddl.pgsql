BEGIN;

-- basic table for managing schema migration
CREATE TABLE tlm__schema_history
(
    version      SERIAL PRIMARY KEY,
    description  TEXT,
    installed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp
);

INSERT INTO tlm__schema_history (description)
VALUES ('TLM Core Schema: DDL');

-- an Object is one instance of a Type
CREATE TABLE tlm__objects
(
    oid    SERIAL PRIMARY KEY,
    "type" INTEGER DEFAULT NULL
    -- type will get its constraints momentarily after the Type type is defined
);

CREATE FUNCTION tlm__current_oid()
    RETURNS INTEGER
    LANGUAGE sql
    STABLE
AS
$$
SELECT currval(pg_get_serial_sequence('tlm__objects', 'oid'))::INTEGER
$$;

CREATE PROCEDURE tlm__insert_object(object_type INTEGER)
    LANGUAGE sql
AS
$$
INSERT INTO tlm__objects (type)
values (object_type);
$$;

-- a Namespace is a special Object that groups Types
CREATE TABLE tlm__namespaces
(
    oid         INTEGER PRIMARY KEY
        REFERENCES tlm__objects (oid)
            ON DELETE CASCADE,
    prefix      VARCHAR NOT NULL UNIQUE,
    uri         VARCHAR NOT NULL UNIQUE,
    description TEXT DEFAULT NULL
);

CREATE FUNCTION tlm__select_namespace_oid(ns_prefix VARCHAR)
    RETURNS INTEGER
    LANGUAGE sql
    STABLE
AS
$$
SELECT oid
FROM tlm__namespaces
WHERE prefix = ns_prefix
LIMIT 1
$$;

-- a Type is a special Object that represents a class of Objects
CREATE TABLE tlm__types
(
    oid         INTEGER PRIMARY KEY
        REFERENCES tlm__objects (oid)
            ON DELETE CASCADE,
    namespace   INTEGER NOT NULL
        REFERENCES tlm__namespaces (oid)
            ON UPDATE CASCADE,
    name        VARCHAR NOT NULL,
    super       INTEGER DEFAULT NULL
        REFERENCES tlm__types (oid),
    -- super will become mandatory momentarily after the first type is defined
    description TEXT    DEFAULT NULL,

    UNIQUE (namespace, name)
);

CREATE FUNCTION tlm__select_type_oid(type_name VARCHAR)
    RETURNS INTEGER
    LANGUAGE sql
    STABLE
AS
$$
SELECT oid
FROM tlm__types
WHERE name = type_name
LIMIT 1
$$;
CREATE FUNCTION tlm__select_type_oid(type_ns VARCHAR, type_name VARCHAR)
    RETURNS INTEGER
    LANGUAGE sql
    STABLE
AS
$$
SELECT oid
FROM tlm__types
WHERE name = type_name
  AND namespace = tlm__select_namespace_oid(type_ns)
LIMIT 1
$$;

CREATE PROCEDURE tlm__insert_object(type_ns VARCHAR, type_name VARCHAR)
    LANGUAGE sql
AS
$$
INSERT INTO tlm__objects (type)
values (tlm__select_type_oid(type_ns, type_name));
$$;

-- define the tlm namespace
INSERT INTO tlm__objects DEFAULT
VALUES;
INSERT INTO tlm__namespaces (oid, prefix, uri, description)
VALUES (tlm__current_oid(),
        'tlm',
        'https://type.link.model.tools/ns/tlm/',
        'The Core TLM namespace.');

-- define the xs namespace
INSERT INTO tlm__objects DEFAULT
VALUES;
INSERT INTO tlm__namespaces (oid, prefix, uri, description)
VALUES (tlm__current_oid(),
        'xs',
        'http://www.w3.org/2001/XMLSchema',
        'Namespaces for XML Schema DataTypes.');

-- define the Namespace type
INSERT INTO tlm__objects DEFAULT
VALUES;
INSERT INTO tlm__types (oid, namespace, name, description)
VALUES (tlm__current_oid(),
        tlm__select_namespace_oid('tlm'),
        'Namespace',
        'The special Type for Namespaces.');
-- update the tlm__objects for the tlm__namespaces to be of type Namespace
UPDATE tlm__objects
SET type = tlm__select_type_oid('Namespace')
WHERE oid = tlm__select_namespace_oid('tlm');
UPDATE tlm__objects
SET type = tlm__select_type_oid('Namespace')
WHERE oid = tlm__select_namespace_oid('xs');

INSERT INTO tlm__objects DEFAULT
VALUES;
INSERT INTO tlm__types (oid, namespace, name, description)
VALUES (tlm__current_oid(),
        tlm__select_namespace_oid('tlm'),
        'Type',
        'The special Type for Types (the meta-Type).');
-- update the namespace tlm__types to have the Type type as its supertype
UPDATE tlm__types
SET super = tlm__select_type_oid('tlm', 'Type')
WHERE oid = tlm__select_type_oid('tlm', 'Namespace');
-- update the object for the Namespace type to be of type Type
UPDATE tlm__objects
SET type = tlm__select_type_oid('tlm', 'Type')
WHERE oid = tlm__select_type_oid('tlm', 'Namespace');
-- update the type type to have the Type type as its supertype
UPDATE tlm__types
SET super = tlm__select_type_oid('tlm', 'Type')
WHERE oid = tlm__select_type_oid('tlm', 'Type');
-- update the object for the Type type to be of type Type
UPDATE tlm__objects
SET type = tlm__select_type_oid('tlm', 'Type')
WHERE oid = tlm__select_type_oid('tlm', 'Type');

-- require tlm__objects to have a type (which we can do now the Type type exists)
ALTER TABLE tlm__objects
    ALTER COLUMN "type" SET NOT NULL,
    ADD CONSTRAINT tlm__objects_type_fkey
        FOREIGN KEY ("type")
            REFERENCES tlm__types (oid);
-- requires tlm__types to have a sypertype (which we can do now the Type type exists)
ALTER TABLE tlm__types
    ALTER COLUMN "super" SET NOT NULL;

-- noinspection SqlUnused
CREATE PROCEDURE tlm__insert_type(ns VARCHAR,
                                  name VARCHAR,
                                  super_ns VARCHAR,
                                  super VARCHAR,
                                  description VARCHAR)
    LANGUAGE SQL AS
$$
CALL tlm__insert_object('tlm', 'Type');
INSERT INTO tlm__types (oid, namespace, name, super, description)
VALUES (tlm__current_oid(),
        tlm__select_namespace_oid(ns),
        name,
        tlm__select_type_oid(super_ns, super),
        description);
$$;

-- noinspection SqlUnused
CREATE PROCEDURE tlm__insert_namespace(prefix VARCHAR, uri VARCHAR, description TEXT, oid INOUT INTEGER = 1)
    LANGUAGE sql
AS
$$
CALL tlm__insert_object('tlm', 'Namespace');
INSERT INTO tlm__namespaces (oid, prefix, uri, description)
VALUES (tlm__current_oid(), prefix, uri, description);
SELECT tlm__current_oid() AS oid;
$$;

COMMIT;
