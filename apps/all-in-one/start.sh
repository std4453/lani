#!/bin/bash

set -e

if [ ! -e /config/config.yaml ] ; then
    echo "/config/config.yaml required"
    exit 255
fi

yq '. *= load("/config/config.yaml")' /deploy/apps/all-in-one/defaults.yaml > merged.yaml

echo "Copying config files..."

cp -v -f merged.yaml /deploy/apps/api-server/config.yaml
cp -v -f merged.yaml /deploy/apps/data-server/config.yaml
cp -v -f merged.yaml /deploy/apps/gateway/config.yaml

# Run database migration
DATABASE_URL=`yq '.postgresUrl' merged.yaml`
(cd /deploy/libs/db; DATABASE_URL=$DATABASE_URL npm run migrate:deploy)

# Create bucket
mkdir -p /storage/images

# 内置 worker 独立由 PM2 管理；外部 endpoint 或关闭匹配时不启动。
export LANI_LOCAL_MATCHER=false
if [ "$(yq '.matching.enabled' merged.yaml)" = true ] && \
   [ "$(yq '.matching.endpoint' merged.yaml)" = http://127.0.0.1:8090 ]; then
    export LANI_LOCAL_MATCHER=true
fi

# Replace bash process
exec pm2-runtime /deploy/apps/all-in-one/ecosystem.config.js
