FROM node:22-bullseye-slim

WORKDIR /deploy/libs/llm-matcher
COPY ./common/deploy /deploy
USER 65534:65534
EXPOSE 8090
ENTRYPOINT ["node", "dist/index.js"]
CMD ["--http", "--host", "0.0.0.0", "--port", "8090"]
