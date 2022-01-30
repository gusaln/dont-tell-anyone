FROM node:16-alpine

WORKDIR /app

COPY package.json ./
COPY yarn.lock ./
RUN yarn

COPY . ./
ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 3000

CMD [ "npm", "run", "dev" ]