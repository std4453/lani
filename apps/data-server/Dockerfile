FROM node:20-bullseye-slim

WORKDIR /deploy/apps/data-server
COPY ./common/deploy /deploy
EXPOSE 8080
CMD ["node", "dist/index.js"]
