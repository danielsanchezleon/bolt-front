#!/bin/sh

# Script para build con variables de entorno
# Uso: ./build-env.sh [dev|prod|local]

ENV=${1:-prod}
BACKEND_URL=${BACKEND_URL:-""}

echo "Building for environment: $ENV"
echo "Backend URL: $BACKEND_URL"

case $ENV in
  "dev")
    if [ ! -z "$BACKEND_URL" ]; then
      # Actualizar environment.dev.ts con la BACKEND_URL
      sed -i "s|apiUrl: '.*'|apiUrl: '$BACKEND_URL'|g" src/environments/environment.dev.ts
    fi
    npx ng build --configuration=dev
    ;;
  "prod")
    if [ ! -z "$BACKEND_URL" ]; then
      # Actualizar environment.prod.ts con la BACKEND_URL
      sed -i "s|apiUrl: '.*'|apiUrl: '$BACKEND_URL'|g" src/environments/environment.prod.ts
    fi
    npx ng build --configuration=production
    ;;
  "local")
    if [ ! -z "$BACKEND_URL" ]; then
      # Actualizar environment.ts con la BACKEND_URL
      sed -i "s|apiUrl: '.*'|apiUrl: '$BACKEND_URL'|g" src/environments/environment.ts
    fi
    npx ng build --configuration=development
    ;;
  *)
    echo "Uso: $0 [dev|prod|local]"
    echo "Variables de entorno disponibles:"
    echo "  BACKEND_URL - URL del backend (opcional)"
    exit 1
    ;;
esac

echo "Build completado para $ENV"