# ===== Build =====
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# ===== Runtime =====
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/build ./build
RUN npm install -g serve
ENV NODE_ENV=production
EXPOSE 3000
CMD ["sh", "-c", "serve -s build -l ${PORT:-3000}"]