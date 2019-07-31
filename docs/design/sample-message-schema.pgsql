CALL insert_namespace(
   prefix      => 'hr',
   uri         => 'https://type.link.model.tools/ns/tlm-sample-hr/',
   description => 'Example namespace for a Human Resources model.'
);

CALL insert_type('tlm', 'Fact', 'tlm', 'Type',
  'A statement about an identified Object in the world considered to be true.');

CALL insert_link(
  from_type_ns        => 'tlm',
  from_type_name      => 'Fact',
  link_name           => 'subject',
  to_type_ns          => 'tlm',
  to_type_name        => 'Type',
  is_singular    => TRUE,
  is_mandatory   => TRUE,
  description         => 'The object this fact is about.'
);



-- done with core schema
INSERT INTO schema_history (description) VALUES ('TLM Core Schema');
