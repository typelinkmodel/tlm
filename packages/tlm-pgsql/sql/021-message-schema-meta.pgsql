BEGIN;
INSERT INTO tlm__schema_history (description) VALUES ('TLM Message Schema: Meta');

CALL tlm__insert_namespace(
   prefix      => 'message',
   uri         => 'https://type.link.model.tools/ns/message/',
   description => 'Namespace for TLM Messages.'
);

CALL tlm__insert_type('message', 'Resolver', 'tlm', 'Type',
  'Can map URIs to URLs. Should implement I2Ls from RFC2483.');

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Resolver',
  link_name           => 'prefix',
  to_type_ns          => 'xs',
  to_type_name        => 'NCName',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  is_value            => TRUE,
  description         => 'Shorthand identifier for the Namespace this resolver Resolves. Must be valid XML namespace prefix, i.e. match [a-z0-9]+.'
);

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Resolver',
  link_name           => 'url',
  to_type_ns          => 'tlm',
  to_type_name        => 'URL',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  is_value            => TRUE,
  description         => 'Valid URL for this resolver.'
);

CALL tlm__insert_type('message', 'Actor', 'tlm', 'Type',
  'An identified party (person, company, system, ...) that has some act to play in relation to a Fact.');

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Actor',
  link_name           => 'id',
  to_type_ns          => 'tlm',
  to_type_name        => 'URI',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  is_value            => TRUE,
  is_primary_id       => TRUE,
  description         => 'A unique resolvable identifier for this Actor.'
);

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Actor',
  link_name           => 'name',
  to_type_ns          => 'xs',
  to_type_name        => 'string',
  is_singular_from    => TRUE,
  is_value            => TRUE,
  description         => 'The human-readable name that most commonly identifies this Actor.'
);

CALL tlm__insert_type('message', 'Message', 'tlm', 'Type',
  'A delivery of Facts about a subject.');

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Message',
  link_name           => 'id',
  to_type_ns          => 'tlm',
  to_type_name        => 'URI',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  is_value            => TRUE,
  is_primary_id       => TRUE,
  description         => 'A unique identifier for this Message.'
);

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Message',
  link_name           => 'subject',
  to_type_ns          => 'tlm',
  to_type_name        => 'Fact',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  description         => 'The main Fact this Message is about.'
);

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Message',
  link_name           => 'subject',
  to_type_ns          => 'message',
  to_type_name        => 'Resolver',
  description         => 'A resolver to use to dereference ids used in the Message.'
);

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Message',
  link_name           => 'body',
  to_type_ns          => 'tlm',
  to_type_name        => 'Fact',
  description         => 'A Fact delivered in the body of the Message.'
);

CALL tlm__insert_type('message', 'Delivery', 'tlm', 'Type',
  'A particular Message delivery from an Actor to an Actor at a time.');

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Message',
  link_name           => 'deliveries',
  to_type_ns          => 'message',
  to_type_name        => 'Delivery',
  to_name             => 'of',
  is_singular_to      => TRUE,
  is_mandatory_from   => TRUE,
  is_mandatory_to     => TRUE,
  description         => 'The message this is a Delivery of.'
);

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Delivery',
  link_name           => 'from',
  to_type_ns          => 'message',
  to_type_name        => 'Actor',
  to_name             => 'sender',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  description         => 'The sender of the Message.'
);

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Delivery',
  link_name           => 'to',
  to_type_ns          => 'message',
  to_type_name        => 'Actor',
  to_name             => 'receiver',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  description         => 'The recipient of the Message.'
);

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Delivery',
  link_name           => 'sent',
  to_type_ns          => 'xs',
  to_type_name        => 'dateTimeStamp',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  is_value            => TRUE,
  description         => 'The instant the Delivery started.'
);

CALL tlm__insert_link(
  from_type_ns        => 'message',
  from_type_name      => 'Delivery',
  link_name           => 'received',
  to_type_ns          => 'xs',
  to_type_name        => 'dateTimeStamp',
  is_singular_from    => TRUE,
  is_value            => TRUE,
  description         => 'The instant the Delivery completed.'
);

COMMIT;
