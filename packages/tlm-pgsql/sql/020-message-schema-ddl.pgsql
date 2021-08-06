BEGIN;
INSERT INTO tlm__schema_history (description)
VALUES ('TLM Messages Schema: DDL');

CREATE TABLE message__resolvers
(
    oid    INTEGER PRIMARY KEY
        REFERENCES tlm__objects (oid)
            ON DELETE CASCADE,
    prefix VARCHAR NOT NULL,
    url    VARCHAR NOT NULL,

    UNIQUE (prefix, url)
);

CREATE TYPE message__resolver AS
(
    oid    INTEGER,
    prefix VARCHAR,
    url    VARCHAR
);

CREATE TABLE message__actors
(
    oid  INTEGER PRIMARY KEY
        REFERENCES tlm__objects (oid)
            ON DELETE CASCADE,
    id   VARCHAR NOT NULL,
    name VARCHAR DEFAULT NULL,

    UNIQUE (id)
);

CREATE TABLE message__messages
(
    oid         INTEGER PRIMARY KEY
        REFERENCES tlm__objects (oid)
            ON DELETE CASCADE,
    id          VARCHAR                  NOT NULL,
    subject     INTEGER                  NOT NULL
        REFERENCES tlm__facts (oid),
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,

    UNIQUE (id)
);

CREATE TYPE message__message AS
(
    oid     INTEGER,
    id      VARCHAR,
    subject INTEGER
);

CREATE TABLE message__message__resolvers
(
    message  INTEGER NOT NULL
        REFERENCES message__messages (oid)
            ON DELETE CASCADE,
    resolver INTEGER NOT NULL
        REFERENCES message__resolvers (oid)
            ON DELETE CASCADE,

    UNIQUE (message, resolver)
);

CREATE TABLE message__message__bodies
(
    message INTEGER NOT NULL
        REFERENCES message__messages (oid)
            ON DELETE CASCADE,
    fact    INTEGER NOT NULL
        REFERENCES tlm__facts (oid)
            ON DELETE CASCADE,

    UNIQUE (message, fact)
);

CREATE TABLE message__deliveries
(
    oid      INTEGER PRIMARY KEY
        REFERENCES tlm__objects (oid)
            ON DELETE CASCADE,
    message  INTEGER                  NOT NULL
        REFERENCES message__messages (oid)
            ON DELETE CASCADE,
    "from"   INTEGER                  NOT NULL
        REFERENCES message__actors (oid),
    "to"     INTEGER                  NOT NULL
        REFERENCES message__actors (oid),
    sent     TIMESTAMP WITH TIME ZONE NOT NULL,
    received TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

CREATE TYPE message__delivery AS
(
    oid      INTEGER,
    message  INTEGER,
    "from"   INTEGER,
    "to"     INTEGER,
    sent     TIMESTAMP,
    received TIMESTAMP
);

COMMIT;
