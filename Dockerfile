FROM node:16.18-buster-slim as builder

ARG PROJ

# setup env variables needed at build time
ENV FRONT_URL="https://api.$PROJ.dev.camap"
ENV FRONT_GRAPHQL_URL=${FRONT_URL}/graphql
ENV CAMAP_HOST="https://app.$PROJ.dev.camap"
ENV MAPBOX_KEY="pk.eyJ1IjoiYnViYXIiLCJhIjoiY2xhaTJoaDMxMGhsODNwbXpveHI5cmRvYSJ9.EamPFVWWXhGRzJX5SOU0xg"
# variable used by webpack to locate the theme to use
ENV THEME_ID="default" 

RUN apt-get update && apt-get install -y \
    g++ \
    libconfig-tiny-perl \
    libtest-script-perl \
    make \
    python3

RUN adduser --disabled-password --disabled-login --gecos "Alilo user" --home /home/alilo alilo

WORKDIR /srv
RUN chown alilo:alilo /srv

# package.json lists a dependency contained in packages dir. So we can't
# run npm install before copying the source
COPY --chown=alilo:alilo orm*.js package.json package-lock.json /srv/
COPY --chown=alilo:alilo packages/ /srv/packages
COPY --chown=alilo:alilo public/ /srv/public

USER alilo

RUN npm --fetch-retries 4 install && npm cache clean --force

# then we build typescript code
RUN npm run build

## remove packages of devDependencies
RUN npm prune --production

COPY --chown=alilo:alilo scripts/ /srv/scripts

# required for the tests below
COPY .env.sample /srv/

# test the startup script
RUN prove scripts/t

FROM node:16.18-buster-slim

RUN adduser --disabled-password --disabled-login --gecos "Alilo user" --home /home/alilo alilo

RUN apt-get update && apt-get install -y \
    libconfig-tiny-perl \
    virtual-mysql-client-core \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=builder /srv/ /srv/

# /etc/alilo may be brought later with a mounted volume
# depending on the number of secrets to manage.
COPY .env.sample /etc/alilo/nest.env

EXPOSE 3010

WORKDIR /srv

ENV NPM_RUN_CMD="start"

CMD [ "/bin/bash", "scripts/start.sh", "/srv/.env", "/etc/alilo/nest.env", "/etc/camap/smtp.env" ]
