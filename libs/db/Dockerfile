# The full Bullseye image includes OpenSSL 1.1 and CA certificates required
# by Prisma 3.15, without installing packages from aging Debian repositories.
FROM node:20-bullseye
RUN openssl version && test -s /etc/ssl/certs/ca-certificates.crt
WORKDIR /deploy/libs/db
COPY --chown=1000:1000 ./common/deploy /deploy

# Fetch every CLI engine for the target runtime at image build time. This uses
# the engine version from Rush's locked Prisma package and never connects to DB.
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
