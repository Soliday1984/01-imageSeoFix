CREATE TABLE IF NOT EXISTS growth_attribution (
  subject_id TEXT PRIMARY KEY,
  attribution_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS growth_events (
  event_key TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  is_test INTEGER NOT NULL DEFAULT 0,
  amount_minor INTEGER,
  currency TEXT,
  payment_kind TEXT,
  attribution_json TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS growth_event_reporting ON growth_events(event_name, is_test, occurred_at);
CREATE INDEX IF NOT EXISTS growth_event_subject ON growth_events(subject_id, event_name);
CREATE TABLE IF NOT EXISTS growth_interactions (
  event_id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  attribution_json TEXT NOT NULL,
  payload_json TEXT NOT NULL
);
