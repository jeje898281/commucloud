#!/bin/bash
docker compose -p community-dev -f docker-compose.dev.yml --env-file .env.dev up -d --build --force-recreate
