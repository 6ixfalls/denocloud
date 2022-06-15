#!/bin/bash
# sudo docker ps -a
deno run --allow-read --allow-net --allow-env /app/relay.ts &
deno run --allow-net --allow-env /app/worker.ts
