FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
ENV NODE_ENV=production
ENV SERVICE_PORT=3002
CMD ["node", "src/index.js"]
