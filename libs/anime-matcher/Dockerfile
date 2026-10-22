FROM python:3.11-slim-bookworm
ARG SEMANTIC=false
ARG PIP_INDEX_URL=https://pypi.org/simple
ARG DEBIAN_MIRROR=https://deb.debian.org
ARG TORCH_INDEX_URL=https://download.pytorch.org/whl/cpu
ARG PIP_DEFAULT_TIMEOUT=120
ARG PIP_RETRIES=3
ENV PYTHONUNBUFFERED=1 OMP_NUM_THREADS=4 OPENBLAS_NUM_THREADS=4 MKL_NUM_THREADS=4
WORKDIR /app
RUN sed -i "s|http://deb.debian.org|${DEBIAN_MIRROR}|g" /etc/apt/sources.list.d/debian.sources \
    && apt-get -o Acquire::Retries=2 -o Acquire::https::Timeout=30 update \
    && apt-get -o Acquire::Retries=2 -o Acquire::https::Timeout=30 install -y --no-install-recommends libgomp1 \
    && rm -rf /var/lib/apt/lists/*
COPY pyproject.toml MANIFEST.in README.md NOTICE.md PROTOCOL.md INTEGRATION.md REPORT.md ./
COPY python ./python
RUN if [ "$SEMANTIC" = true ]; then \
      pip install --no-cache-dir --no-deps torch==2.5.1 --index-url "$TORCH_INDEX_URL" \
      && pip install --no-cache-dir '.[semantic]'; \
    else pip install --no-cache-dir .; fi
RUN useradd --create-home --uid 10001 matcher
USER matcher
ENV LANI_MATCHER_MODEL_DIR=/models
EXPOSE 8090
ENTRYPOINT ["lani-anime-matcher", "--http", "--host", "0.0.0.0", "--port", "8090"]
