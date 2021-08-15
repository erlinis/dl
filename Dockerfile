FROM node:16.1.0-alpine3.13

WORKDIR /app

COPY package.json .
RUN yarn install

COPY . .

CMD ["yarn", "start"]
