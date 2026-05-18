-- Runs on first boot of the Postgres container.
-- The user/db are created by the postgres image entrypoint; we just enable
-- extensions the schema relies on.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
