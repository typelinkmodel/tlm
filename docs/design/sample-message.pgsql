-- 1) message

CALL message__insert_message(
  id => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e'
);

-- 2) all objects in the message

CALL message__insert_resolver(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  prefix         => 'mailto',
  url            => 'https://directory.example.com/person/'
);
CALL message__insert_resolver(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  prefix         => 'mailto',
  url            => 'https://directory.example.com/department/'
);
CALL message__insert_resolver(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  prefix         => 'mailto',
  url            => 'https://directory.example.com/team/'
);

CALL hr__insert_person(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:leo@example.com'
);
CALL hr__insert_person(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:simon@example.com'
);
CALL hr__insert_person(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:dirkx@example.com'
);

CALL hr__insert_department(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:engineering@example.com'
);

CALL hr__insert_team(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:content-management-eng@example.com'
);
CALL hr__insert_team(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:transcoding-eng@example.com'
);
CALL hr__insert_team(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:eng-management@example.com'
);

-- 3) the message subject

CALL message__insert_subject(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link_ns        => 'hr',
  link           => 'coachedBy',
  target         => 'mailto:simon@example.com'
);

-- 4) all other facts about all objects in the message

CALL message__insert_value_fact(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link_ns        => 'tlm',
  link           => 'name',
  value_type_ns  => 'xdt',
  value_type     => 'string',
  value          => 'Leo Simons'
);
CALL message__insert_link_fact(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link_ns        => 'hr',
  link           => 'department',
  value_type_ns  => 'hr',
  value_type     => 'Department',
  value          => 'mailto:engineering@example.com'
);
CALL message__insert_link_set_fact(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link_ns        => 'hr',
  link           => 'teams',
  value_type_ns  => 'hr',
  value_type     => 'Team',
  value          => 'mailto:content-management-eng@example.com'
);
CALL message__insert_link_set_fact(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link_ns        => 'hr',
  link           => 'teams',
  value_type_ns  => 'hr',
  value_type     => 'Team',
  value          => 'mailto:transcoding-eng@example.com'
);
CALL message__insert_link_set_fact(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link_ns        => 'hr',
  link           => 'teams',
  value_type_ns  => 'hr',
  value_type     => 'Team',
  value          => 'mailto:eng-management@example.com'
);

CALL message__insert_toggle_fact(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:simon@example.com',
  link_ns        => 'hr',
  link           => 'teams',
  value_type_ns  => 'xdt',
  value_type     => 'boolean',
  value          => TRUE
);

-- (...some more facts here...)

-- 5) delivery info

CALL message__insert_delivery(
  message        => 'uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  from           => 'mailto:simon@example.com',
  to             => 'mailto:hr-dept@example.com',
  sent           => '20180611T20:09:01Z',
  received       => '20180611T20:09:27Z'
);
