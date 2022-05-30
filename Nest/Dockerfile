FROM alpine:3.15.0

RUN apk update; apk add nodejs npm python3;
RUN npm i -g @nestjs/cli

EXPOSE 3000 4000

CMD npm install --prefix /vol/app; npm run start:dev --prefix /vol/app
