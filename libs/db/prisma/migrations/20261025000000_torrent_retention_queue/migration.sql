BEGIN;

CREATE TABLE IF NOT EXISTS background_jobs (
  id serial PRIMARY KEY,
  queue_name text NOT NULL,
  key text NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'failed')),
  available_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  failed_at timestamptz,
  last_error text,
  UNIQUE (queue_name, key)
);
CREATE INDEX IF NOT EXISTS background_jobs_queue_name_id_idx ON background_jobs(queue_name, id);
COMMENT ON TABLE background_jobs IS E'@omit';

COMMIT;
