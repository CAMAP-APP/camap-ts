#!/bin/bash

set -e

perl scripts/tune-env-file.pl $@


if [[ $DB_HOST ]]
then
    DB_STRING="--host=$DB_HOST --user=$DB_USERNAME --password="$DB_PASSWORD" $DB_DATABASE"
    users=0

    if (echo "show tables;" | mysql $DB_STRING | grep '^User$')
    then
        echo "start.sh: Found User tables in $DB_DATABASE database, checking its content"
        users=$(echo "select count(*) from User;" | mysql $DB_STRING --skip-column-names )
        echo "start.sh: Found $users users in User table"
    else
        echo "start.sh: could not find User table. Will initialise DB"
    fi

    if [[ $users == 0 ]]
    then
        echo "start.sh: Initialising data in $DB_DATABASE database"
        npm run schema:sync
        npm run dataset ${DB_DATABASE%%-db} -- --noFail
    else
        echo "start.sh: Skipping $DB_DATABASE database initialisation"
    fi
fi

if [[ $NPM_RUN_CMD ]]
then
    echo "start.sh: running npm run $NPM_RUN_CMD";
    NODE_ENV=production npm run $NPM_RUN_CMD
fi

