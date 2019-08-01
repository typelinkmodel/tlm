BEGIN;
SELECT plan( 7 );

-- link tests for toggles
SELECT throws_ok($$ CALL tlm__insert_link(
                    from_type_ns        => 'tlm',
                    from_type_name      => 'Link',
                    link_name           => 'test-link',
                    to_type_ns          => 'tlm',
                    to_type_name        => 'Link',
                    is_singular_from    => TRUE,
                    is_value            => FALSE,
                    is_mandatory_from   => TRUE,
                    is_toggle           => TRUE,
                    description         => 'Invalid toggle that is not a value.'
                 ); $$,
                 '23514',
                 NULL,
                 'Should get constraint violation for toggle that is not a value');
SELECT throws_ok($$ CALL tlm__insert_link(
                    from_type_ns        => 'tlm',
                    from_type_name      => 'Link',
                    link_name           => 'test-link',
                    to_type_ns          => 'xs',
                    to_type_name        => 'boolean',
                    is_singular_from    => FALSE,
                    is_value            => TRUE,
                    is_mandatory_from   => TRUE,
                    is_toggle           => TRUE,
                    description         => 'Invalid toggle that is not singular.'
                 ); $$,
                 '23514',
                 NULL,
                 'Should get constraint violation for toggle that is not singular');
SELECT throws_ok($$ CALL tlm__insert_link(
                    from_type_ns        => 'tlm',
                    from_type_name      => 'Link',
                    link_name           => 'test-link',
                    to_type_ns          => 'xs',
                    to_type_name        => 'boolean',
                    is_singular_from    => TRUE,
                    is_value            => TRUE,
                    is_mandatory_from   => FALSE,
                    is_toggle           => TRUE,
                    description         => 'Invalid toggle that is not mandatory.'
                 ); $$,
                 '23514',
                 NULL,
                 'Should get constraint violation for toggle that is not mandatory');
SELECT throws_ok($$ CALL tlm__insert_link(
                    from_type_ns        => 'tlm',
                    from_type_name      => 'Link',
                    link_name           => 'test-link',
                    to_type_ns          => 'xs',
                    to_type_name        => 'boolean',
                    is_toggle           => TRUE,
                    is_primary_id       => TRUE,
                    description         => 'Invalid toggle used as id.'
                 ); $$,
                 '23514',
                 NULL,
                 'Should get constraint violation for toggle that is a primary id');

-- link tests for primary ids
SELECT throws_ok($$ CALL tlm__insert_link(
                    from_type_ns        => 'tlm',
                    from_type_name      => 'Link',
                    link_name           => 'test-link',
                    to_type_ns          => 'xs',
                    to_type_name        => 'anyURI',
                    is_singular_from    => TRUE,
                    is_value            => FALSE,
                    is_mandatory_from   => TRUE,
                    is_primary_id       => TRUE,
                    description         => 'Invalid primary id that is not a value.'
                 ); $$,
                 '23514',
                 NULL,
                 'Should get constraint violation for primary id that is not a value');
SELECT throws_ok($$ CALL tlm__insert_link(
                    from_type_ns        => 'tlm',
                    from_type_name      => 'Link',
                    link_name           => 'test-link',
                    to_type_ns          => 'xs',
                    to_type_name        => 'anyURI',
                    is_singular_from    => FALSE,
                    is_value            => TRUE,
                    is_mandatory_from   => TRUE,
                    is_primary_id       => TRUE,
                    description         => 'Invalid primary id that is not singular.'
                 ); $$,
                 '23514',
                 NULL,
                 'Should get constraint violation for primary id that is not unique');
SELECT throws_ok($$ CALL tlm__insert_link(
                    from_type_ns        => 'tlm',
                    from_type_name      => 'Link',
                    link_name           => 'test-link',
                    to_type_ns          => 'xs',
                    to_type_name        => 'anyURI',
                    is_singular_from    => TRUE,
                    is_value            => TRUE,
                    is_mandatory_from   => FALSE,
                    is_primary_id       => TRUE,
                    description         => 'Invalid primary id that is not mandatory.'
                 ); $$,
                 '23514',
                 NULL,
                 'Should get constraint violation for primary id that is not mandatory');

SELECT * FROM finish();
ROLLBACK;
