#!/bin/sh
set -eu

# 仅供测试；只有显式 true 才启用，绝不将任意环境变量内容写入 JSON。
enabled=false
if [ "${LANI_TEST_ROUTING_ENABLED:-false}" = "true" ]; then
    enabled=true
fi
printf '{"enabled":%s}\n' "$enabled" > /usr/share/nginx/html/test-routing.json
