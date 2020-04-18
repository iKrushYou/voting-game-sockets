FROM node:10-alpine

WORKDIR /usr/src/app

COPY . .

RUN yarn

RUN cd ui && yarn && yarn build

EXPOSE 8080

ENTRYPOINT ["node", "app.js"]
