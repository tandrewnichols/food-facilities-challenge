#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "postgres" <<-EOSQL
	CREATE DATABASE radai;
	GRANT ALL PRIVILEGES ON DATABASE radai TO $POSTGRES_USER;
EOSQL
