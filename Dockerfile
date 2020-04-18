FROM node:10

WORKDIR /usr/src/app

COPY . .

RUN yarn

RUN cd ui && yarn && yarn build

EXPOSE 8080

CMD ["node", "app.js"]
