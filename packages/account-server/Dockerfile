FROM node:12-alpine
WORKDIR /usr/src/server
COPY . .
RUN ["chmod", "+x", "/usr/src/server/wait-for"]
EXPOSE 3001
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh
RUN npm i
CMD npm start