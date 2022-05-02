FROM alpine:3.15.0

RUN apk update ;\
apk add nginx ;\
mkdir -p /run/nginx ;

COPY ./srcs/default.conf /etc/nginx/http.d/
COPY ./srcs/localhost.crt /etc/ssl/certs/localhost.crt
COPY ./srcs/localhost.key /etc/ssl/certs/localhost.key

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
