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
  subject_type   => 'Person',
  subject_ns     => 'hr',
  link           => 'coachedBy',
  target         => 'mailto:simon@example.com'
);

-- 5) delivery info

CALL message__insert_delivery(
  message        => 'urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
  sender         => 'mailto:dirk@example.com',
  receiver       => 'mailto:hr-dept@example.com',
  sendTime       => '20180611T20:09:01Z',
  receiveTime    => '20180611T20:09:27Z'
);
