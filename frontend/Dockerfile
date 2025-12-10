# Frontend (React)
FROM node:16

WORKDIR /app

# Copy package config
COPY package.json package-lock.json ./

RUN npm install

# Copy toàn bộ source còn lại
COPY . .

# Build app
RUN npm run build

EXPOSE 3000

# Dùng serve để serve static build
CMD ["npx", "serve", "build"]
