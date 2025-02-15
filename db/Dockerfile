FROM postgres:15

COPY init.sql /docker-entrypoint-initdb.d/
COPY functions.sql /docker-entrypoint-initdb.d/
