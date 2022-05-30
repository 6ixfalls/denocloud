#!/bin/sh
sudo rm -r vendor/
sudo docker container run -v $(pwd):/app -w /app/ lukechannings/deno:latest vendor main.ts relay.ts