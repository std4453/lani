FROM nginx

COPY ./common/deploy/apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./common/deploy/apps/admin/dist /usr/share/nginx/html
COPY ./common/deploy/apps/admin/docker-entrypoint.d /docker-entrypoint.d
RUN chmod +x /docker-entrypoint.d/40-test-routing.sh
EXPOSE 8080
