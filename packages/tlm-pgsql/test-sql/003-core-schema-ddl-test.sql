BEGIN;
SELECT plan( 2 );

-- schema_history tests
SELECT cmp_ok(count(*), '>=', 10::bigint,
    'We are keeping track of schema history')
FROM tlm__schema_history;

-- object tests
CALL tlm__insert_object(3);
SELECT is(max(oid)::integer, tlm__current_oid(),
    'Current oid is the last inserted one')
FROM tlm__objects;


SELECT * FROM finish();
ROLLBACK;
