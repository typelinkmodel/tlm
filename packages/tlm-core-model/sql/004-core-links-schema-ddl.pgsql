BEGIN;
INSERT INTO tlm__schema_history (description) VALUES ('TLM Core Schema: Links DDL');

CREATE TABLE tlm__links (
  oid            INTEGER PRIMARY KEY
      REFERENCES tlm__objects (oid)
      ON DELETE CASCADE,
  from_type      INTEGER NOT NULL
      REFERENCES tlm__types (oid),
  to_type        INTEGER NOT NULL
      REFERENCES tlm__types (oid),
  name           VARCHAR NOT NULL,
  from_name      VARCHAR DEFAULT NULL,
  to_name        VARCHAR DEFAULT NULL,
  is_singular    BOOLEAN NOT NULL DEFAULT FALSE,
  is_mandatory   BOOLEAN NOT NULL DEFAULT FALSE,
  is_toggle      BOOLEAN NOT NULL DEFAULT FALSE,
  is_value       BOOLEAN NOT NULL DEFAULT FALSE,
  is_primary_id  BOOLEAN NOT NULL DEFAULT FALSE,
  description    TEXT DEFAULT NULL,

  UNIQUE (from_type, to_type, name)

  -- todo check is_toggle != is_value
  -- todo check is_toggle means is_mandatory
);

CREATE PROCEDURE tlm__insert_link (
  from_type_ns    VARCHAR,
  from_type_name  VARCHAR,
  link_name       VARCHAR,
  to_type_ns      VARCHAR,
  to_type_name    VARCHAR,
  from_name       VARCHAR DEFAULT NULL,
  to_name         VARCHAR DEFAULT NULL,
  is_singular     BOOLEAN DEFAULT FALSE,
  is_mandatory    BOOLEAN DEFAULT FALSE,
  is_toggle       BOOLEAN DEFAULT FALSE,
  is_value        BOOLEAN DEFAULT FALSE,
  is_primary_id   BOOLEAN DEFAULT FALSE,
  description     TEXT DEFAULT NULL
) LANGUAGE SQL AS $$
    INSERT INTO tlm__objects ("type") values (tlm__select_type_oid('tlm', 'Link'));
    INSERT INTO tlm__links
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
        tlm__current_oid(),
        tlm__select_type_oid(from_type_ns, from_type_name),
        tlm__select_type_oid(to_type_ns, to_type_name),
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

COMMIT;
