#!/bin/bash

# ===============================================
# BOLT Revolution - Docker Frontend PRODUCCIÓN
# ===============================================

set -e

echo "🚀 BOLT Revolution - Frontend PRODUCCIÓN"

# Verificar que existe el Dockerfile
if [ ! -f Dockerfile ]; then
    echo "❌ Dockerfile no encontrado"
    exit 1
fi

echo "📦 Usando configuración de Dockerfile"

# Confirmación para producción
echo "🚨 ¡ATENCIÓN! Modo PRODUCCIÓN (optimizado para Azure)"
read -p "¿Continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelado"
    exit 1
fi

# Limpiar contenedor anterior
echo "🧹 Limpiando contenedor anterior..."
docker stop bolt-frontend 2>/dev/null || true
docker rm bolt-frontend 2>/dev/null || true

echo "🔨 Construyendo imagen optimizada..."
docker build -t bolt-frontend:production .

# Verificar que la imagen se construyó correctamente
if [ $? -ne 0 ]; then
    echo "❌ Error al construir la imagen"
    exit 1
fi

# Iniciar contenedor
echo "🚀 Iniciando frontend..."
docker run -d \
    --name bolt-frontend \
    --network bolt_revolution_bck_default \
    -p 80:80 \
    bolt-frontend:production

echo "⏳ Esperando inicio..."
sleep 10

# Verificar contenedor
if [ "$(docker inspect -f '{{.State.Running}}' bolt-frontend 2>/dev/null)" = "true" ]; then
    echo "✅ Contenedor iniciado"
else
    echo "❌ Error al iniciar"
    docker logs bolt-frontend
    exit 1
fi

echo ""
echo "✅ Frontend PRODUCCIÓN iniciado!"
echo "🌐 Frontend:   http://localhost"
echo "🔗 APIs:      http://localhost/api/* → backend:8081"
echo ""
echo "📋 Comandos útiles:"
echo "  docker logs -f bolt-frontend                        # Ver logs"
echo "  docker stop bolt-frontend                           # Parar"
echo "  docker stats bolt-frontend                          # Ver recursos"
echo "  curl http://localhost                               # Probar frontend"
echo ""

# Opción de logs
read -p "¿Ver logs en tiempo real? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📋 Logs (Ctrl+C para salir):"
    docker logs -f bolt-frontend
else
    echo "✅ Ejecutándose en segundo plano"
fi
