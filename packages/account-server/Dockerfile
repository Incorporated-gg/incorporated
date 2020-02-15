FROM node:lts-alpine
WORKDIR /usr/src/server
COPY . .
EXPOSE 3001
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && npm i
CMD npm run migrate_dev_docker && npm start