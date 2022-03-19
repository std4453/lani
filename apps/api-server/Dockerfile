FROM node:14-bullseye-slim

WORKDIR /deploy/apps/api-server
COPY ./common/deploy /deploy
EXPOSE 8080
CMD npm run prisma:gen && npm run start
