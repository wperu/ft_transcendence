FROM alpine:3.15.0

RUN apk update ;\
apk add nginx ;\
mkdir -p /run/nginx ;

COPY ./srcs/default.conf /etc/nginx/http.d/

EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]