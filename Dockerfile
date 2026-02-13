
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

# Variables de entorno para el build
ARG BUILD_ENV=runtime
ARG BACKEND_URL=""

COPY . .

# Si BUILD_ENV=runtime, usar configuración con placeholder
# Si BUILD_ENV=dev/prod, usar configuración específica
RUN chmod +x build-env.sh && \
    if [ "$BUILD_ENV" = "runtime" ]; then \
      echo "Building with runtime configuration..."; \
      npx ng build --configuration=runtime; \
    else \
      echo "Building with specific environment: $BUILD_ENV"; \
      BUILD_ENV=$BUILD_ENV BACKEND_URL=$BACKEND_URL ./build-env.sh $BUILD_ENV; \
    fi

FROM nginx:1.25-alpine AS production

# Copiar archivos compilados
COPY --from=build /app/dist/prueba /usr/share/nginx/html

# Copiar template de nginx y script de inicialización unificado
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Variables de entorno por defecto
ENV BACKEND_URL="https://bolt-revolution-back.service-insights.com"
ENV BACKEND_API_URL="https://bolt-revolution-back.service-insights.com/api"
ENV IS_PRODUCTION="false"
ENV USE_RUNTIME_CONFIG="false"

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
