FROM node:20.12.1-slim AS builder

RUN apt-get update && apt-get install -y \
    g++ libconfig-tiny-perl libtest-script-perl make python3 && \
    rm -rf /var/lib/apt/lists/*

RUN adduser --disabled-password --disabled-login --gecos "InterAMAP user" --home /home/interamap interamap
WORKDIR /srv
RUN chown interamap:interamap /srv

# code & deps (sans .env)
COPY --chown=interamap:interamap ./orm*.js ./package.json ./package-lock.json /srv/
COPY --chown=interamap:interamap ./packages/ /srv/packages
COPY --chown=interamap:interamap ./public/  /srv/public

# use .env configuration for builder
 COPY --chown=interamap:interamap ./.env.sample /srv/.env
 RUN bash -c "source /srv/.env && export"

USER interamap
RUN npm install --fetch-retries 4 && npm cache clean --force
RUN npm rebuild node-sass --force --prefix packages/api-core || true
RUN npm rebuild bcrypt --prefix packages/api-core || true
RUN npm rebuild sharp --prefix packages/api-core || true
RUN npm run build
RUN npm prune --production

RUN set -eux; \
    test -d /srv/packages/api-core/dist/mails; \
    mkdir -p /srv/mails; \
    cp -a /srv/packages/api-core/dist/mails /srv/mails/dist;

COPY --chown=interamap:interamap ./scripts/ /srv/scripts

# ---------- runtime ----------
FROM node:20.12.1-slim

LABEL org.opencontainers.image.authors="InterAMAP44 inter@amap44.org"
LABEL org.opencontainers.image.vendor="InterAMAP 44"
LABEL org.opencontainers.image.source="https://github.com/CAMAP-APP/camap-ts"
LABEL org.opencontainers.image.licenses="GPL-3.0-or-later"
LABEL description="Camap nest container"
LABEL org.opencontainers.image.description="Container 2/3 de l'application Camap (camap-ts)"

RUN adduser --disabled-password --disabled-login --gecos "InterAMAP user" --home /home/interamap interamap
RUN apt-get update && apt-get install -y \
		libconfig-tiny-perl \
		virtual-mysql-client-core \
		procps \
		&& rm -rf /var/lib/apt/lists/*
ENV TZ="Europe/Paris" \
	NODE_ENV="production"

RUN echo "Europe/Paris" > /etc/timezone

WORKDIR /srv
COPY --from=builder /srv/ /srv/
RUN install -d -o interamap -g interamap -m 0775 /srv/src
# ⚠️ pas de COPY de .env ici : il sera monté par docker-compose
USER interamap

CMD ["node", "packages/api-core/dist/main.js"]
