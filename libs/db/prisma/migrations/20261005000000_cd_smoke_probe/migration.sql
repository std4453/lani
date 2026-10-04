-- Temporary deployment rehearsal only. Do not merge this migration.
-- Isolated from application schemas; remove the schema and this migration's
-- history record after the rehearsal using the saved pre-release snapshot.
BEGIN;
CREATE SCHEMA cd_release_probe;
CREATE TABLE cd_release_probe.marker (
  id INTEGER PRIMARY KEY,
  message TEXT NOT NULL
);
INSERT INTO cd_release_probe.marker (id, message)
VALUES (1, 'migration deployment rehearsal');
COMMIT;
