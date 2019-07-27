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
