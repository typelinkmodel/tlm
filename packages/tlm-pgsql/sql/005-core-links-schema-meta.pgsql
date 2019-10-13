BEGIN;
INSERT INTO tlm__schema_history (description) VALUES ('TLM Core Schema: Links DDL');

CALL tlm__insert_type('tlm', 'Link', 'tlm', 'Type',
  'A relation between types.');

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'from type',
  to_type_ns          => 'tlm',
  to_type_name        => 'Type',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  description         => 'The type this link belongs to.'
);

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'to type',
  to_type_ns          => 'tlm',
  to_type_name        => 'Type',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  description         => 'The type this link points to.'
);

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'name',
  to_type_ns          => 'xs',
  to_type_name        => 'Name',
  is_singular_from    => TRUE,
  is_mandatory_from   => TRUE,
  is_value            => TRUE,
  description         => 'The name of the link.'
);

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'from name',
  to_type_ns          => 'xs',
  to_type_name        => 'string',
  is_singular_from    => TRUE,
  is_value            => TRUE,
  description         => 'The name for the link for the "from" type.'
);

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'to name',
  to_type_ns          => 'xs',
  to_type_name        => 'string',
  is_singular_from    => TRUE,
  is_value            => TRUE,
  description         => 'The name for the link for the "to" type.'
);

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'is singular',
  to_type_ns          => 'xs',
  to_type_name        => 'boolean',
  is_singular_from    => TRUE,
  is_value            => TRUE,
  is_mandatory_from   => TRUE,
  is_toggle           => TRUE,
  description         => 'Whether there can be a single link like this for the "from" type.'
);

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'is mandatory',
  to_type_ns          => 'xs',
  to_type_name        => 'boolean',
  is_singular_from    => TRUE,
  is_value            => TRUE,
  is_mandatory_from   => TRUE,
  is_toggle           => TRUE,
  description         => 'Whether there has to be a value for the "from" type.'
);

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'is toggle',
  to_type_ns          => 'xs',
  to_type_name        => 'boolean',
  is_singular_from    => TRUE,
  is_value            => TRUE,
  is_mandatory_from   => TRUE,
  is_toggle           => TRUE,
  description         => 'Whether this is a simple boolean link.'
);

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'is value',
  to_type_ns          => 'xs',
  to_type_name        => 'boolean',
  is_singular_from    => TRUE,
  is_value            => TRUE,
  is_mandatory_from   => TRUE,
  is_toggle           => TRUE,
  description         => 'Whether this link is to a ValueType.'
);

CALL tlm__insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Link',
  link_name           => 'is primary id',
  to_type_ns          => 'xs',
  to_type_name        => 'boolean',
  is_singular_from    => TRUE,
  is_value            => TRUE,
  is_mandatory_from   => TRUE,
  is_toggle           => TRUE,
  description         => 'Whether this link is to a primary identifier.'
);

COMMIT;
