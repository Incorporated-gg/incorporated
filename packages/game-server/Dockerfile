FROM node:12-alpine
WORKDIR /usr/src/server
COPY . .
RUN ["chmod", "+x", "/usr/src/server/wait-for"]
EXPOSE 3001
RUN npm i
CMD npm start