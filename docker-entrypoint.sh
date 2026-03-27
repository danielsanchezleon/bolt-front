#!/bin/sh

# Script de inicialización unificado para nginx + Angular
# Soporta configuración estática (build time) y dinámica (runtime)

# Configurar valores por defecto
BACKEND_URL=${BACKEND_URL:-"https://bolt-revolution-back.service-insights.com"}
BACKEND_API_URL=${BACKEND_API_URL:-"$BACKEND_URL/api"}
IS_PRODUCTION=${IS_PRODUCTION:-"false"}
USE_RUNTIME_CONFIG=${USE_RUNTIME_CONFIG:-"false"}

echo "=== BOLT FRONTEND STARTUP ==="
echo "BACKEND_URL (nginx proxy): $BACKEND_URL"
echo "BACKEND_API_URL (Angular services): $BACKEND_API_URL"
echo "IS_PRODUCTION (production flag): $IS_PRODUCTION"
echo "USE_RUNTIME_CONFIG: $USE_RUNTIME_CONFIG"

# 1. Configurar nginx proxy (siempre necesario)
echo "Configurando nginx proxy..."
envsubst '$BACKEND_URL' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# 2. Si usa configuración runtime, reemplazar placeholders en archivos JavaScript
if [ "$USE_RUNTIME_CONFIG" = "true" ]; then
    echo "🔄 Configurando placeholders dinámicos en archivos JavaScript..."
    
    # Buscar archivos main-*.js en el directorio compilado
    for js_file in /usr/share/nginx/html/main-*.js; do
      if [ -f "$js_file" ]; then
        echo "Procesando: $js_file"
        
        # Reemplazar placeholder de URL backend API
        sed -i "s|BACKEND_API_URL_PLACEHOLDER|$BACKEND_API_URL|g" "$js_file"
        
        # Reemplazar placeholder de production flag
        sed -i "s|production:false.*IS_PRODUCTION_PLACEHOLDER|production:$IS_PRODUCTION|g" "$js_file"
        
        echo "✅ Placeholders reemplazados en $js_file"
      fi
    done
    
    # Buscar en todos los archivos JS por si los placeholders están en otros archivos
    find /usr/share/nginx/html -name "*.js" -type f | while read file; do
      if grep -q ".*_PLACEHOLDER" "$file"; then
        echo "Procesando archivo JS adicional: $file"
        sed -i "s|BACKEND_API_URL_PLACEHOLDER|$BACKEND_API_URL|g" "$file"
        sed -i "s|production:false.*IS_PRODUCTION_PLACEHOLDER|production:$IS_PRODUCTION|g" "$file"
      fi
    done
    
    echo "✅ Configuración dinámica completada"
else
    echo "⚡ Usando configuración estática (compilada en build time)"
fi

echo "=== CONFIGURACIÓN COMPLETADA ==="
echo "Iniciando nginx..."

# Iniciar nginx
exec "$@"