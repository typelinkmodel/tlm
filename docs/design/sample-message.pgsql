INSERT INTO tlm__message
(id,
 subject_type,
 subject_type_ns,
 subject_id,
 fact_name,
 fact_target,
 delivery_sender,
 delivery_receiver,
 delivery_sendTime,
 delivery_receiveTime)
VALUES ('urn:uuid:def5b225-3e0d-4d6e-8f48-9b8cd17bc35e',
        'Person',
        'hr',
        'mailto:leo@example.com'
            'coach',
        'mailto:simon@example.com',
        'mailto:dirk@example.com',
        'mailto:hr-dept@example.com',
        '20180611T20:09:01Z',
        '20180611T20:09:27Z');
