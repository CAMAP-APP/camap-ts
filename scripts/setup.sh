#!/bin/bash

npm install;

# COPY .ENV
DIR_NAME=$(dirname $0)
ROOT_DIR=$DIR_NAME"/.."
ENV_FILE=$ROOT_DIR"/.env"
if [ ! -f "$ENV_FILE" ]; then
   cp $ROOT_DIR"/.env.sample" $ENV_FILE
fi