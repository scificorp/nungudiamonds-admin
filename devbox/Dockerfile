FROM node:22-bookworm

SHELL ["/bin/bash", "-lc"]

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    chromium \
    curl \
    fonts-liberation \
    git \
    jq \
    lsof \
    make \
    procps \
    python3 \
    postgresql \
    postgresql-client \
    rsync \
  && pg_bin="$(dirname "$(find /usr/lib/postgresql -type f -name initdb | sort -V | tail -1)")" \
  && ln -sf "${pg_bin}/initdb" /usr/local/bin/initdb \
  && ln -sf "${pg_bin}/pg_ctl" /usr/local/bin/pg_ctl \
  && ln -sf "${pg_bin}/psql" /usr/local/bin/psql \
  && ln -sf "${pg_bin}/createdb" /usr/local/bin/createdb \
  && rm -rf /var/lib/apt/lists/*

ENV CHROMIUM_PATH=/usr/bin/chromium
