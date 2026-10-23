# MinIO 已停止分发社区版二进制，按上游固定发布版本从源码构建。
FROM golang:1.24.8-bookworm AS minio-builder
ENV CGO_ENABLED=0 GOBIN=/out GOFLAGS=-p=2
RUN go install github.com/minio/minio@RELEASE.2025-10-15T17-29-55Z

# 与最终镜像使用相同发行版，避免复制跨 glibc 版本的 Python 运行时。
FROM python:3.11-slim-bullseye AS python-base
FROM python-base AS matcher-runtime
ARG MATCHER_SEMANTIC=false
ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu
ARG PIP_INDEX_URL=https://pypi.org/simple
WORKDIR /matcher
COPY libs/anime-matcher/pyproject.toml libs/anime-matcher/MANIFEST.in libs/anime-matcher/README.md libs/anime-matcher/NOTICE.md libs/anime-matcher/PROTOCOL.md libs/anime-matcher/INTEGRATION.md ./
COPY libs/anime-matcher/python ./python
RUN if [ "$MATCHER_SEMANTIC" = true ]; then pip install --no-cache-dir torch==2.14.1+cpu --index-url "$TORCH_INDEX_URL" \
    && pip install --no-cache-dir '.[semantic]'; \
    else pip install --no-cache-dir .; fi

FROM node:22-bullseye-slim AS matcher-base
COPY --from=python-base /etc/ssl/certs /etc/ssl/certs

# Install nginx
# Bullseye 已归档；保留签名校验，仅关闭归档元数据的有效期检查。
RUN printf '%s\n' \
    'deb [check-valid-until=no] https://archive.debian.org/debian bullseye main' \
    'deb [check-valid-until=no] https://archive.debian.org/debian-security bullseye-security main' \
    > /etc/apt/sources.list \
    && apt-get -o Acquire::Retries=2 -o Acquire::https::Timeout=30 update \
    && apt-get -o Acquire::Retries=2 -o Acquire::https::Timeout=30 install -y \
    openssl \
    ca-certificates \
    nginx \
    wget \
    libgomp1 \
    libbz2-1.0 \
    libexpat1 \
    libffi7 \
    liblzma5 \
    libncursesw6 \
    libreadline8 \
    libsqlite3-0 \
    libuuid1 \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

COPY --from=matcher-runtime /usr/local /usr/local
RUN ldconfig && python3 -c 'import lani_anime_matcher.worker'
ENV PYTHONUNBUFFERED=1 OMP_NUM_THREADS=4 OPENBLAS_NUM_THREADS=4 MKL_NUM_THREADS=4

FROM matcher-base
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
