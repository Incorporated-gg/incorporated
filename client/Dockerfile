FROM node:lts-alpine
WORKDIR /usr/src/client
COPY package*.json ./
RUN npm i --silent
COPY . .
EXPOSE 3000
CMD npm start