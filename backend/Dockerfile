FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p /app/uploads

EXPOSE 12345

CMD ["npm", "start"]
