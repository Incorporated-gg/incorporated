FROM node:lts-alpine
WORKDIR /usr/src/server
COPY . .
EXPOSE 3001
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN npm i
CMD npm start