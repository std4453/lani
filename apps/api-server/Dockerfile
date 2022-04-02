FROM node:14-bullseye-slim

WORKDIR /deploy/apps/api-server
COPY --chown=1000 ./common/deploy /deploy
EXPOSE 8080
USER 1000
CMD npm run prisma:gen && npm run start:prod
