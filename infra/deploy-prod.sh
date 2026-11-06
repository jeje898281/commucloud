#!/bin/bash
docker compose -p community-prod -f docker-compose.prod.yml --env-file .env.prod up -d --build --force-recreate