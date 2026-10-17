# Prisma 原生引擎使用系统 OpenSSL 1.1，与 Node 自带的 OpenSSL 版本无关。
FROM node:22-bullseye-slim
# Bullseye 已归档；保留签名校验，仅关闭归档元数据的有效期检查。
RUN printf '%s\n' \
    'deb [check-valid-until=no] http://archive.debian.org/debian bullseye main' \
    'deb [check-valid-until=no] http://archive.debian.org/debian-security bullseye-security main' \
    > /etc/apt/sources.list \
    && apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN openssl version && test -s /etc/ssl/certs/ca-certificates.crt
WORKDIR /deploy/libs/db
COPY --chown=1000:1000 ./common/deploy /deploy

# 构建时按锁文件版本准备 CLI 引擎，避免迁移启动时联网下载；此步骤不连接数据库。
ENV PRISMA_CLI_BINARY_TARGETS=debian-openssl-1.1.x \
    CHECKPOINT_DISABLE=1
RUN node -e 'const p = require.resolve("@prisma/engines", { paths: [require.resolve("prisma/package.json")] }); require(p).ensureBinariesExist().catch(() => process.exit(1));' \
    && mkdir /opt/prisma \
    && node -e 'const fs = require("fs"), path = require("path"); const root = path.dirname(require.resolve("@prisma/engines/package.json", { paths: [require.resolve("prisma/package.json")] })); fs.copyFileSync(path.join(root, "migration-engine-debian-openssl-1.1.x"), "/opt/prisma/migration-engine");' \
    && chmod 755 /opt/prisma/migration-engine \
    && /opt/prisma/migration-engine --version
ENV PRISMA_MIGRATION_ENGINE_BINARY=/opt/prisma/migration-engine
USER 1000:1000
CMD ["npm", "run", "migrate:deploy"]
