FROM alpine:3.15.0

RUN apk update; apk add nodejs npm;
RUN apk add nginx ;\
mkdir -p /run/nginx ;

COPY ./srcs/default.conf /etc/nginx/http.d/
COPY ./srcs/start.sh .
EXPOSE 3000

CMD ./start.sh