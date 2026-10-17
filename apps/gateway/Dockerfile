FROM node:22-bullseye-slim

WORKDIR /deploy/apps/gateway
COPY ./common/deploy /deploy
EXPOSE 8080
CMD ["node", "dist/index.js"]
