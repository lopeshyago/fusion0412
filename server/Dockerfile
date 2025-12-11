# server/Dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN apk add --no-cache python3 make g++
RUN npm install --omit=dev
COPY . .
EXPOSE 4001
CMD ["node", "server.js"]