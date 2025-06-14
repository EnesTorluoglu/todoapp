FROM node:22-alpine3.19

WORKDIR /todoApp

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

WORKDIR /todoApp/src

EXPOSE 3001

CMD ["node", "index.js"]