BEGIN;
SELECT plan( 1 );

SELECT ok(
    (CALL message__insert_message(
        id             => 'urn:uuid:197437f0-2c58-4a04-94f7-0cacb0dd334a',
        subject        => 'mailto:leo@example.com',
        link_ns        => 'hr',
        link           => 'coachedBy',
        target         => 'mailto:simon@example.com'
    )),
    'Insert basic message');
SELECT throws_ok($$
    CALL message__insert_message(
        id             => NULL,
        subject        => 'mailto:leo@example.com',
        link_ns        => 'hr',
        link           => 'coachedBy',
        target         => 'mailto:simon@example.com'
    )
    $$,
    'Message must have id');
SELECT throws_ok($$
    CALL message__insert_message(
        id             => 'urn:uuid:197437f0-2c58-4a04-94f7-0cacb0dd334a',
        subject        => NULL,
        link_ns        => 'hr',
        link           => 'coachedBy',
        target         => 'mailto:simon@example.com'
    )
    $$,
    'Message must have subject');
SELECT throws_ok($$
    CALL message__insert_message(
        id             => 'urn:uuid:197437f0-2c58-4a04-94f7-0cacb0dd334a',
        subject        => 'mailto:leo@example.com',
        link_ns        => NULL,
        link           => 'coachedBy',
        target         => 'mailto:simon@example.com'
    )
    $$,
    'Message must have link_ns');
SELECT throws_ok($$
    CALL message__insert_message(
        id             => 'urn:uuid:197437f0-2c58-4a04-94f7-0cacb0dd334a',
        subject        => 'mailto:leo@example.com',
        link_ns        => 'hr',
        link           => NULL,
        target         => 'mailto:simon@example.com'
    )
    $$,
    'Message must have link');
SELECT throws_ok($$
    CALL message__insert_message(
        id             => 'urn:uuid:197437f0-2c58-4a04-94f7-0cacb0dd334a',
        subject        => 'mailto:simon@example.com',
        link_ns        => 'hr',
        link           => 'coaches',
        value          => FALSE
    )
    $$,
    'Message can be toggle');
SELECT isa_ok(
    (SELECT oid FROM message__messages WHERE id = 'urn:uuid:197437f0-2c58-4a04-94f7-0cacb0dd334a'),
    'integer',
    'Message gets an oid' );

SELECT * FROM finish();
ROLLBACK;
