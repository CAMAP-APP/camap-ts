#!/bin/bash

# Download and copy a json file containing countries french names and ISO codes

DIR_NAME=$(dirname $0)
ROOT_DIR=$DIR_NAME"/.."
GIT_DIR=$ROOT_DIR/tmp/world_countries
LANGS=(fr)
DESTS=($ROOT_DIR/packages/front-core/public/data)

if [ -d $GIT_DIR ] 
then
    git -C $GIT_DIR pull
else
    git clone https://github.com/stefangabos/world_countries $GIT_DIR
fi

for lang in ${LANGS[*]}
do
    for dest in ${DESTS[*]}
    do
        mkdir -p $dest/$lang/
        cp $GIT_DIR/data/countries/$lang/world.json $dest/$lang/iso-3166-1.json
    done
done
