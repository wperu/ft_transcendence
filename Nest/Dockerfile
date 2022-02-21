FROM alpine:3.15.0

RUN apk update; apk add nodejs npm; npm i -g @nestjs/cli;

RUN npm install --save @nestjs/typeorm typeorm pg

EXPOSE 3000

CMD npm run start:dev --prefix /vol/project