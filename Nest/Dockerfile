FROM alpine:3.15.0

RUN apk update; apk add nodejs npm python3;

EXPOSE 3000 4000

CMD npm install --prefix /vol/app --platform=linuxmusl --arch=x64 sharp; npm install --prefix /vol/app; npm run start:dev --prefix /vol/app
