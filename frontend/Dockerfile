FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --silent
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
