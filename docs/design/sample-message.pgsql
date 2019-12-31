-- 1) message

CALL message__insert_message(
  id => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e'
);

-- 2) all objects in the message

CALL hr__insert_person(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:leo@example.com'
);
CALL hr__insert_person(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:simon@example.com'
);
CALL hr__insert_person(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:dirk@example.com'
);

CALL hr__insert_department(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:engineering@example.com'
);

CALL hr__insert_team(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:content-management-eng@example.com'
);
CALL hr__insert_team(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:transcoding-eng@example.com'
);
CALL hr__insert_team(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  id             => 'mailto:eng-management@example.com'
);

-- 3) the message subject

CALL message__insert_subject(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link           => 'coachedBy',
  target         => 'mailto:simon@example.com'
);

-- 4) all other facts about all objects in the message

CALL message__insert_value_fact(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link           => 'name',
  value_type_ns  => 'xs',
  value_type     => 'string',
  value          => 'Leo Simons'
);
CALL message__insert_link_fact(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link           => 'department',
  value_type_ns  => 'hr',
  value_type     => 'Department',
  value          => 'mailto:engineering@example.com'
);
CALL message__insert_link_set_fact(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link           => 'team',
  value_type_ns  => 'hr',
  value_type     => 'Team',
  value          => 'mailto:content-management-eng@example.com'
);
CALL message__insert_link_set_fact(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link           => 'team',
  value_type_ns  => 'hr',
  value_type     => 'Team',
  value          => 'mailto:transcoding-eng@example.com'
);
CALL message__insert_link_set_fact(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:leo@example.com',
  link           => 'team',
  value_type_ns  => 'hr',
  value_type     => 'Team',
  value          => 'mailto:eng-management@example.com'
);

CALL message__insert_toggle_fact(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  subject        => 'mailto:simon@example.com',
  link           => 'coaches',
  value_type_ns  => 'xs',
  value_type     => 'boolean',
  value          => TRUE
);

-- (...some more facts here...)

-- 5) delivery info

CALL message__insert_delivery(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  sender         => 'mailto:dirk@example.com',
  receiver       => 'mailto:hr-dept@example.com',
  sendTime       => '20180611T20:09:01Z',
  receiveTime    => '20180611T20:09:27Z'
);
