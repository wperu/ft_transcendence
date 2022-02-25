FROM alpine:3.15.0

RUN apk update; apk add nodejs npm;

EXPOSE 3000

CMD npm install --prefix /vol/app; npm run start --prefix /vol/app

#Installing react, react-dom, and react-scripts with cra-template-typescript...