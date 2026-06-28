# MedStory frontend — сборка Vite + раздача через nginx с проксированием /api
FROM node:18-alpine AS build

WORKDIR /app
COPY frontend/package.json ./
COPY frontend/package-lock.json* ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# --- Раздача статики ---
FROM nginx:1.27-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
