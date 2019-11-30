FROM node:lts-alpine
WORKDIR /usr/src/server
COPY package*.json ./
RUN npm i --silent
COPY . .
EXPOSE 3001
CMD npm start