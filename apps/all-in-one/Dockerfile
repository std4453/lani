# MinIO 已停止分发社区版二进制，按上游固定发布版本从源码构建。
FROM golang:1.24.8-bookworm AS minio-builder
ENV CGO_ENABLED=0 GOBIN=/out GOFLAGS=-p=2
RUN go install github.com/minio/minio@RELEASE.2025-10-15T17-29-55Z

FROM node:22-bullseye-slim

# Install nginx
# Bullseye 已归档；保留签名校验，仅关闭归档元数据的有效期检查。
RUN printf '%s\n' \
    'deb [check-valid-until=no] http://archive.debian.org/debian bullseye main' \
    'deb [check-valid-until=no] http://archive.debian.org/debian-security bullseye-security main' \
    > /etc/apt/sources.list \
    && apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    nginx \
    wget \
    && rm -rf /var/lib/apt/lists/*

# 运行镜像继续使用 Bullseye；MinIO 为静态链接二进制。
COPY --from=minio-builder /out/minio /usr/bin/minio

# Install yq
RUN wget https://github.com/mikefarah/yq/releases/download/v4.28.1/yq_linux_amd64 -O /usr/bin/yq
RUN chmod +x /usr/bin/yq

# Install pm2
RUN npm install pm2 -g

WORKDIR /deploy/apps/all-in-one
COPY ./common/deploy/apps/all-in-one/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./common/deploy /deploy

EXPOSE 8080

CMD ["/deploy/apps/all-in-one/start.sh"]
