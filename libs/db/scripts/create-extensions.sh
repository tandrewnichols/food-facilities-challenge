#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
  CREATE EXTENSION IF NOT EXISTS pgcrypto;
  CREATE EXTENSION IF NOT EXISTS cube SCHEMA pg_catalog;
  CREATE EXTENSION IF NOT EXISTS earthdistance SCHEMA pg_catalog;
EOSQL
