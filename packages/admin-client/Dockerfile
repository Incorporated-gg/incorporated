FROM node:lts-alpine
WORKDIR /usr/src/client
COPY . .
EXPOSE 8080
RUN npm i --silent
CMD npm run serve