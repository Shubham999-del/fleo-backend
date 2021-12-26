#Import nodejs image
FROM node:erbium

WORKDIR /app

RUN mkdir ./uploads
 
COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 6500

CMD ["npm", "start"]