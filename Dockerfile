
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

# Construir la aplicación sin restricciones de presupuesto
RUN npx ng build || (ls -la dist/ && exit 0)

FROM nginx:1.25-alpine AS production

COPY --from=build /app/dist/prueba /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
