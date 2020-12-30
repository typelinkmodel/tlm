BEGIN;
INSERT INTO tlm__schema_history (description)
VALUES ('TLM Core Schema: Facts Meta');

CALL tlm__insert_type('tlm', 'Fact', 'tlm', 'Type',
                      'A statement about an identified Object in the world considered to be true.');

CALL tlm__insert_link(
        from_type_ns => 'tlm',
        from_type_name => 'Fact',
        link_name => 'subject',
        to_type_ns => 'tlm',
        to_type_name => 'Type',
        is_singular_from => TRUE,
        is_mandatory_from => TRUE,
        description => 'The object this fact is about.'
    );

CALL tlm__insert_link(
        from_type_ns => 'tlm',
        from_type_name => 'Fact',
        link_name => 'link',
        to_type_ns => 'tlm',
        to_type_name => 'Link',
        is_singular_from => TRUE,
        is_mandatory_from => TRUE,
        description => 'The kind of fact this is, defined by the kind of Link.'
    );

CALL tlm__insert_type('tlm', 'LinkFact', 'tlm', 'Fact',
                      'A fact about an object its relation to another object.');

CALL tlm__insert_link(
        from_type_ns => 'tlm',
        from_type_name => 'LinkFact',
        link_name => 'target',
        to_type_ns => 'tlm',
        to_type_name => 'Type',
        is_mandatory_from => TRUE,
        description => 'The target object of this link fact.'
    );

CALL tlm__insert_type('tlm', 'ToggleFact', 'tlm', 'Fact',
                      'A fact about an object that is either true (defined) or false (absent).');

CALL tlm__insert_link(
        from_type_ns => 'tlm',
        from_type_name => 'ToggleFact',
        link_name => 'toggle',
        to_type_ns => 'xs',
        to_type_name => 'boolean',
        is_singular_from => TRUE,
        is_mandatory_from => TRUE,
        is_value => TRUE,
        is_toggle => TRUE,
        description => 'Whether the specific toggle is set or not for this Object.'
    );

CALL tlm__insert_type('tlm', 'ValueFact', 'tlm', 'LinkFact',
                      'A fact about an object that has as its target a primitive value.');

COMMIT;
