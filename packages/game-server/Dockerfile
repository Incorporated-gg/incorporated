FROM node:lts-alpine
WORKDIR /usr/src/server
COPY . .
EXPOSE 3001
RUN npm i
CMD npm run migrate_dev_docker && npm start