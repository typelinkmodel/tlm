BEGIN;
INSERT INTO tlm__schema_history (description) VALUES ('TLM Report Schema');

CREATE FUNCTION tlm__report_schema(max_description INTEGER DEFAULT 20)
  RETURNS TABLE (
    oid INTEGER,
    object_type VARCHAR,
    ns_prefix VARCHAR,
    type_name VARCHAR,
    parent_type VARCHAR,
    link_from VARCHAR,
    link_name VARCHAR,
    link_to VARCHAR,
    sf BOOLEAN,
    mf BOOLEAN,
    st BOOLEAN,
    mt BOOLEAN,
    v BOOLEAN,
    t BOOLEAN,
    p BOOLEAN,
    description TEXT
  )
  LANGUAGE sql
  AS $$
    SELECT
        DISTINCT(o.oid) AS oid,
        CONCAT(t_n.prefix, ':', t.name) AS object_type,
        n.prefix AS ns_prefix,
        CASE WHEN t2.name IS NULL THEN NULL
            ELSE CONCAT(t2_n.prefix, ':', t2.name)
        END AS type_name,
        CASE WHEN t3.name IS NULL THEN NULL
            ELSE CONCAT(t3_n.prefix, ':', t3.name)
        END AS parent_type,
        CASE WHEN l_from.name IS NULL THEN NULL
            ELSE CONCAT(l_from_n.prefix, ':', l_from.name)
        END AS link_from,
        l.name link_name,
        CASE WHEN l_to.name IS NULL THEN NULL
            ELSE CONCAT(l_to_n.prefix, ':', l_to.name)
        END AS link_to,
        l.is_singular_from AS sf,
        l.is_mandatory_from AS mf,
        l.is_singular_to AS st,
        l.is_mandatory_to AS mt,
        l.is_value AS v,
        l.is_toggle AS t,
        l.is_primary_id AS p,
        CASE WHEN t2.name IS NOT NULL THEN substring(t2.description from 0 for max_description)
            WHEN n.prefix IS NOT NULL THEN substring(n.description from 0 for max_description)
            WHEN l.name IS NOT NULL THEN substring(l.description from 0 for max_description)
            ELSE NULL
        END AS description
      FROM tlm__objects o
      LEFT OUTER JOIN tlm__types t              ON o.type = t.oid
      LEFT OUTER JOIN tlm__namespaces t_n       ON t.namespace = t_n.oid

      LEFT OUTER JOIN tlm__namespaces n         ON o.oid = n.oid

      LEFT OUTER JOIN tlm__types t2             ON o.oid = t2.oid
      LEFT OUTER JOIN tlm__namespaces t2_n      ON t2.namespace = t2_n.oid
      LEFT OUTER JOIN tlm__types t3             ON t2.super = t3.oid
      LEFT OUTER JOIN tlm__namespaces t3_n      ON t3.namespace = t3_n.oid

      LEFT OUTER JOIN tlm__links l              ON l.oid = o.oid
      LEFT OUTER JOIN tlm__types l_from         ON l.from_type = l_from.oid
      LEFT OUTER JOIN tlm__namespaces l_from_n  ON l_from.namespace = l_from_n.oid
      LEFT OUTER JOIN tlm__types l_to           ON l.to_type = l_to.oid
      LEFT OUTER JOIN tlm__namespaces l_to_n    ON l_to.namespace = l_to_n.oid

      WHERE o.type IN (
        tlm__select_type_oid('tlm', 'Namespace'),
        tlm__select_type_oid('tlm', 'Type'),
        tlm__select_type_oid('tlm', 'Link')
      )

      ORDER BY o.oid ASC;
$$;

COMMIT;

SELECT * FROM tlm__report_schema(max_description => 20);
