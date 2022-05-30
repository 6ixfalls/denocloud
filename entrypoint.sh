#!/bin/bash
# sudo docker ps -a
deno run --no-remote --import-map=/app/vendor/import_map.json --allow-read --allow-net --allow-env /app/relay.ts &
deno run --no-remote --import-map=/app/vendor/import_map.json --allow-net --allow-env /app/main.ts
