FROM node:latest

COPY package.json /todoApp/
COPY package-lock.json /todoApp/
COPY .gitignore /todoApp/
COPY src /todoApp/

WORKDIR /todoApp

RUN npm install

CMD ["node", "index.js"]