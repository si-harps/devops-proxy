#!/bin/sh

if [ -z ${GET_CONSUL_HOST+x} ];
  then `npm start`;
  else `CONSUL_HOST=$(curl -s $GET_CONSUL_HOST) npm start`;
fi
