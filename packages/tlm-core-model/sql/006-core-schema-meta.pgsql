BEGIN;
INSERT INTO tlm__schema_history (description) VALUES ('TLM Core Schema: Meta');

CALL tlm__insert_link(
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

CALL tlm__insert_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Namespace',
  link_name      => 'description',
  to_type_ns     => 'xdt',
  to_type_name   => 'string',
  is_singular    => TRUE,
  is_value       => TRUE,
  description    => 'Friendly human-readable description of the Namespace.'
);

CALL tlm__insert_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'type',
  to_type_ns     => 'tlm',
  to_type_name   => 'Type',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The Type of the Object itself.'
);

CALL tlm__insert_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'namespace',
  to_type_ns     => 'tlm',
  to_type_name   => 'Namespace',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The namespace this Type belongs to.'
);

CALL tlm__insert_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'super',
  to_type_ns     => 'tlm',
  to_type_name   => 'Type',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The supertype of this Type. It inherits all possible Links from its supertype.'
);

CALL tlm__insert_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'name',
  to_type_ns     => 'xdt',
  to_type_name   => 'string',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description    => 'The name of the Type. Should be unique within a namespace.'
);

CALL tlm__insert_link(
  from_type_ns   => 'tlm',
  from_type_name => 'Type',
  link_name      => 'description',
  to_type_ns     => 'xdt',
  to_type_name   => 'string',
  is_singular    => TRUE,
  is_value       => TRUE,
  description    => 'Friendly human-readable description of the Type.'
);

COMMIT;