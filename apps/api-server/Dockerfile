FROM node:22-bullseye-slim

# Prisma 的原生引擎链接 Bullseye 系统 OpenSSL 1.1。
# Bullseye 已归档；保留签名校验，仅关闭归档元数据的有效期检查。
RUN printf '%s\n' \
    'deb [check-valid-until=no] http://archive.debian.org/debian bullseye main' \
    'deb [check-valid-until=no] http://archive.debian.org/debian-security bullseye-security main' \
    > /etc/apt/sources.list \
    && apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /deploy/apps/api-server
COPY --chown=1000 ./common/deploy /deploy
EXPOSE 8080
USER 1000
CMD ["node", "dist/main"]
