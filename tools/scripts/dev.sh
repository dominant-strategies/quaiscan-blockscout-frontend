#!/bin/bash

# download assets for the running instance
dotenv \
  -e .env.development.local \
  -e .env.local \
  -e .env.development \
  -e .env \
  -- bash -c './deploy/scripts/download_assets.sh ./public/assets'

yarn svg:build-sprite
echo ""

# Get git tag or use default
GIT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "0.0.1")

# generate envs.js file and run the app
dotenv \
  -v NEXT_PUBLIC_GIT_COMMIT_SHA=$(git rev-parse --short HEAD) \
  -v NEXT_PUBLIC_GIT_TAG=$GIT_TAG \
  -e .env.secrets \
  -e .env.development.local \
  -e .env.local \
  -e .env.development \
  -e .env \
  -- bash -c './deploy/scripts/make_envs_script.sh && next dev --webpack -p $NEXT_PUBLIC_APP_PORT' |
pino-pretty
