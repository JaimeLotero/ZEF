FROM node:16.9.1

COPY . .
RUN npm i

CMD ["node", "index.js"]