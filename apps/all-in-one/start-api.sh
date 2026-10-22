#!/bin/bash
set -e
if [ "${LANI_LOCAL_MATCHER:-false}" = true ]; then
    node /deploy/apps/all-in-one/wait-matcher.cjs
fi
exec npm run start:prod
