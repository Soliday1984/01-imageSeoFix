-- Read-only. Unknown sources remain unknown; test rows are excluded.
SELECT event_name, json_extract(attribution_json, '$.source') AS source,
  json_extract(attribution_json, '$.medium') AS medium, COUNT(*) AS operations,
  COUNT(DISTINCT subject_id) AS subjects
FROM growth_events WHERE is_test = 0
GROUP BY event_name, source, medium ORDER BY event_name, operations DESC;

-- Gross payments by currency and kind. Never add currencies together.
SELECT currency, payment_kind, COUNT(*) AS transactions, SUM(amount_minor) AS gross_minor
FROM growth_events WHERE event_name = 'purchase' AND is_test = 0 AND amount_minor > 0
GROUP BY currency, payment_kind;
