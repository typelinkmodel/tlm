BEGIN;
INSERT INTO tlm__schema_history (description) VALUES ('TLM Core Schema: Facts DDL');

CREATE TABLE tlm__facts (
  oid            INTEGER PRIMARY KEY
      REFERENCES tlm__objects (oid)
      ON DELETE CASCADE,
  subject        INTEGER NOT NULL
      REFERENCES tlm__objects (oid)
      ON DELETE CASCADE,
  link           INTEGER NOT NULL
      REFERENCES tlm__links (oid)
      ON DELETE CASCADE
);

CREATE TYPE tlm__fact AS (
  oid INTEGER,
  subject INTEGER,
  link INTEGER
);

CREATE TABLE tlm__link_facts ( -- extends tlm__facts
  -- for singular links
  oid            INTEGER PRIMARY KEY
      REFERENCES tlm__facts (oid)
      ON DELETE CASCADE,
  target         INTEGER NOT NULL
      REFERENCES tlm__objects (oid)
      ON DELETE CASCADE
);

CREATE TABLE tlm__link_fact_sets ( -- extends tlm__facts
  -- for plural links
  oid            INTEGER
      REFERENCES tlm__facts (oid)
      ON DELETE CASCADE,
  target         INTEGER NOT NULL
      REFERENCES tlm__objects (oid)
      ON DELETE CASCADE,
  
  PRIMARY KEY (oid, target)
);

CREATE TYPE tlm__link_fact AS (
  oid      INTEGER,
  subject  INTEGER,
  link     INTEGER,
  target   INTEGER
);

CREATE TABLE tlm__toggle_facts ( -- extends tlm__facts
  oid            INTEGER PRIMARY KEY
      REFERENCES tlm__facts (oid)
      ON DELETE CASCADE,
  toggle         BOOLEAN NOT NULL
);

CREATE TYPE tlm__toggle_fact AS (
  oid      INTEGER,
  subject  INTEGER,
  link     INTEGER,
  toggle   BOOLEAN
);

CREATE TABLE tlm__value_facts ( -- extends tlm__facts
  -- for singular values  
  oid            INTEGER PRIMARY KEY
      REFERENCES tlm__facts (oid)
      ON DELETE CASCADE,
  value          TEXT DEFAULT NULL,
  value_type     INTEGER NOT NULL
      REFERENCES tlm__types (oid)
);

CREATE TABLE tlm__value_fact_sets ( -- extends tlm__facts
  -- for plural values    
  oid            INTEGER
      REFERENCES tlm__facts (oid)
      ON DELETE CASCADE,
  value          TEXT DEFAULT NULL,
  value_type     INTEGER NOT NULL
      REFERENCES tlm__types (oid),
  
  PRIMARY KEY (oid, value, value_type)
);

CREATE TYPE tlm__value_fact AS (
  oid         INTEGER,
  subject     INTEGER,
  link        INTEGER,
  value       TEXT,
  value_type  INTEGER
);

COMMIT;
