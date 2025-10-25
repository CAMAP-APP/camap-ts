FROM node:20.12.1 as builder

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
COPY --chown=interamap:interamap ./scripts/ /srv/scripts

USER interamap
RUN npm install --fetch-retries 4 && npm cache clean --force
RUN npm rebuild node-sass --force --prefix packages/api-core || true
RUN npm rebuild bcrypt --prefix packages/api-core || true
RUN npm rebuild sharp --prefix packages/api-core || true
RUN npm run build
RUN npm prune --production

# ---------- runtime ----------
FROM node:20.12.1
RUN adduser --disabled-password --disabled-login --gecos "InterAMAP user" --home /home/interamap interamap
RUN apt-get update && apt-get install -y libconfig-tiny-perl virtual-mysql-client-core procps && \
    rm -rf /var/lib/apt/lists/*
ENV TZ="Europe/Paris"
RUN echo "Europe/Paris" > /etc/timezone

WORKDIR /srv
COPY --from=builder /srv/ /srv/
# ⚠️ pas de COPY de .env ici : il sera monté par docker-compose

USER interamap
# HEALTHCHECK optionnel si tu exposes /health
# HEALTHCHECK --interval=30s --timeout=5s --retries=5 CMD curl -fsS http://127.0.0.1:3010/health || exit 1

CMD ["node", "packages/api-core/dist/main.js"]
