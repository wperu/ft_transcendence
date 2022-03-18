FROM alpine:3.15.0

RUN apk update; apk add nodejs npm;

EXPOSE 3000 4000

CMD npm install --prefix /vol/project; npm run start:dev --prefix /vol/project