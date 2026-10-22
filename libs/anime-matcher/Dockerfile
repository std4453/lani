# syntax=docker/dockerfile:1.7
ARG VARIANT=lexical
ARG WITH_MODELS=false
FROM python:3.11-slim-bookworm AS base
ARG PIP_INDEX_URL=https://pypi.org/simple
ARG DEBIAN_MIRROR=https://deb.debian.org
ARG PIP_DEFAULT_TIMEOUT=120
ARG PIP_RETRIES=3
ENV PYTHONUNBUFFERED=1 OMP_NUM_THREADS=4 OPENBLAS_NUM_THREADS=4 MKL_NUM_THREADS=4 \
    HF_HUB_OFFLINE=1 TRANSFORMERS_OFFLINE=1
WORKDIR /app
RUN sed -i "s|http://deb.debian.org|${DEBIAN_MIRROR}|g" /etc/apt/sources.list.d/debian.sources \
    && apt-get -o Acquire::Retries=2 update \
    && apt-get install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 matcher
COPY pyproject.toml docker/install-dependencies.py ./
RUN --mount=type=cache,target=/root/.cache/pip python install-dependencies.py lexical

FROM base AS runtime-lexical
ENV LANI_MATCHER_SEMANTIC=false LANI_MATCHER_DEVICE=cpu

FROM base AS runtime-semantic-cpu
RUN --mount=type=cache,target=/root/.cache/pip python install-dependencies.py cpu
ENV LANI_MATCHER_SEMANTIC=true LANI_MATCHER_DEVICE=cpu

FROM base AS runtime-semantic-cu126
RUN --mount=type=cache,target=/root/.cache/pip python install-dependencies.py cu126
ENV LANI_MATCHER_SEMANTIC=true LANI_MATCHER_DEVICE=cuda

# 下载层只依赖下载器和固定模型清单，不随业务代码变化失效。
FROM python:3.11-slim-bookworm AS models-true
COPY python/lani_anime_matcher/models.py /download/models.py
COPY python/lani_anime_matcher/assets/models.json python/lani_anime_matcher/assets/qwen-0.6b.upstream.json /download/assets/
RUN --mount=type=cache,target=/model-cache python /download/models.py --model-dir /model-cache \
    && mkdir /models && cp -a /model-cache/e5-base /model-cache/qwen-0.6b /models/
FROM scratch AS models-false
COPY docker/empty-models/ /models/
FROM models-${WITH_MODELS} AS models

FROM runtime-${VARIANT} AS application
COPY MANIFEST.in README.md NOTICE.md PROTOCOL.md INTEGRATION.md REPORT.md ./
COPY licenses /usr/share/licenses/lani-anime-matcher
COPY NOTICE.md /usr/share/licenses/lani-anime-matcher/NOTICE.md
COPY python ./python
RUN pip install --no-cache-dir --no-deps . && pip check
# 大权重放在最后一层；不遮住镜像默认目录，外部目录通过参数显式指定。
COPY --from=models --chown=10001:10001 /models /opt/lani/models
ARG VARIANT
ARG WITH_MODELS
LABEL dev.lani.variant=$VARIANT dev.lani.bundled-models=$WITH_MODELS
ENV LANI_MATCHER_MODEL_DIR=/opt/lani/models
USER matcher
EXPOSE 8090
ENTRYPOINT ["lani-anime-matcher", "--http", "--host", "0.0.0.0", "--port", "8090"]
