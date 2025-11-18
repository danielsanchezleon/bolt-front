# Sistema de Variables de Entorno para Bolt Front

## Descripción
Sistema flexible que permite configurar URLs de backend tanto en build time (Angular) como en runtime (nginx) usando variables de entorno Unix.

## Variables de Entorno

### Build Time (Angular)
- `BUILD_ENV`: Entorno de build (`dev`, `prod`, `local`)
- `BACKEND_URL`: URL del backend para Angular services

### Runtime (Kubernetes)
- `BACKEND_URL`: URL del backend para proxy de nginx (sin /api)
- `BACKEND_API_URL`: URL del backend que será usada por la aplicación Angular (ej: `https://bolt-revolution-api-dev.example.com`)
- `IS_PRODUCTION`: `true/false` - flag de producción para Angular
- `USE_RUNTIME_CONFIG`: `true/false` - activa reemplazo de URLs cuando arranca el contenedor

### 🔧 ¿Qué significa USE_RUNTIME_CONFIG?
USE_RUNTIME_CONFIG=false → Usa URLs que se compilaron en build time (fijas en la imagen)
USE_RUNTIME_CONFIG=true → Reemplaza URLs dinámicamente cuando arranca el contenedor

## Uso

### 1. Build local con variables de entorno
```bash
# Build para desarrollo con URL custom
BACKEND_URL="https://bolt-revolution-back-dev.service-insights.com/api" ./build-env.sh dev

# Build para producción con URL custom
BACKEND_URL="https://bolt-revolution-back-prod.service-insights.com/api" ./build-env.sh prod

# Build local
BACKEND_URL="http://localhost:8080/api" ./build-env.sh local
```

### 2. Build con Docker
```bash
# Build para desarrollo
docker build --build-arg BUILD_ENV=dev --build-arg BACKEND_URL="https://bolt-revolution-back-dev.service-insights.com/api" -t bolt-fe:dev .

# Build para producción
docker build --build-arg BUILD_ENV=prod --build-arg BACKEND_URL="https://bolt-revolution-back-prod.service-insights.com/api" -t bolt-fe:prod .
```

### 3. Ejecutar contenedor con URL de backend runtime
```bash
# Desarrollo
docker run -e BACKEND_URL="https://bolt-revolution-back-dev.service-insights.com" -p 8080:80 bolt-fe:dev

# Producción
docker run -e BACKEND_URL="https://bolt-revolution-back-prod.service-insights.com" -p 8080:80 bolt-fe:prod
```

### 4. Kubernetes Deployment

#### **Opción A: Imagen con configuración estática (BUILD_ENV=dev/prod)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bolt-frontend-dev
spec:
  template:
    spec:
      containers:
      - name: frontend
        # Imagen construida con: docker build --build-arg BUILD_ENV=dev --build-arg BACKEND_URL="https://dev.com/api" -t bolt-fe:dev .
        image: logstreamingacrpro.azurecr.io/bolt-revolution-fe:dev
        env:
        - name: BACKEND_URL  # Solo para nginx proxy
          value: "https://bolt-revolution-back-dev.service-insights.com"
        ports:
        - containerPort: 80
```

#### **Opción B: Imagen universal con configuración dinámica (BUILD_ENV=runtime) - RECOMENDADO**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bolt-frontend
spec:
  template:
    spec:
      containers:
      - name: frontend
        # Imagen construida con: docker build --build-arg BUILD_ENV=runtime -t bolt-fe:universal .
        image: logstreamingacrpro.azurecr.io/bolt-revolution-fe:universal
        env:
        - name: USE_RUNTIME_CONFIG
          value: "true"  # Activa configuración dinámica
        - name: BACKEND_URL  # Para nginx proxy
          value: "https://bolt-revolution-back-dev.service-insights.com"
        - name: BACKEND_API_URL  # Para Angular (se reemplaza en archivos JS)
          value: "https://bolt-revolution-back-dev.service-insights.com/api"
        ports:
        - containerPort: 80
---
# Para ambiente de producción (misma imagen, diferentes variables)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bolt-frontend-prod
spec:
  template:
    spec:
      containers:
      - name: frontend
        image: logstreamingacrpro.azurecr.io/bolt-revolution-fe:universal  # ¡Misma imagen!
        env:
        - name: USE_RUNTIME_CONFIG
          value: "true"
        - name: BACKEND_URL
          value: "https://bolt-revolution-back-prod.service-insights.com"
        - name: BACKEND_API_URL
          value: "https://bolt-revolution-back-prod.service-insights.com/api"
        ports:
        - containerPort: 80
```

## Archivos del Sistema

### Configuración Angular
- `src/environments/environment.ts` - Local development
- `src/environments/environment.dev.ts` - Development environment  
- `src/environments/environment.prod.ts` - Production environment

### Build & Deploy
- `build-env.sh` - Script de build con variables de entorno
- `Dockerfile` - Dockerfile unificado con soporte para configuración estática y dinámica
- `nginx.conf.template` - Template de nginx con variables
- `docker-entrypoint.sh` - Script de inicialización unificado (soporta ambos modos)

## Configuraciones Angular Disponibles
- `ng build --configuration=development` - Local (environment.ts)
- `ng build --configuration=dev` - Development (environment.dev.ts)
- `ng build --configuration=production` - Production (environment.prod.ts)

## Estrategias Disponibles

### **Estrategia 1: Build Time (una imagen por entorno)**
```bash
# Build imagen específica para cada entorno
docker build --build-arg BUILD_ENV=dev --build-arg BACKEND_URL="https://dev.com/api" -t bolt-fe:dev .
docker build --build-arg BUILD_ENV=prod --build-arg BACKEND_URL="https://prod.com/api" -t bolt-fe:prod .

# Ejecutar con configuración fija
docker run bolt-fe:dev  # URL ya compilada en la imagen
```

### **Estrategia 2: Runtime Configuration (una imagen para todos) - RECOMENDADO**  
```bash
# Build una sola imagen universal con placeholders
docker build --build-arg BUILD_ENV=runtime -t bolt-fe:universal .

# Usar en diferentes entornos cambiando variables de entorno
docker run -e USE_RUNTIME_CONFIG=true -e BACKEND_API_URL="https://dev.com/api" bolt-fe:universal
docker run -e USE_RUNTIME_CONFIG=true -e BACKEND_API_URL="https://prod.com/api" bolt-fe:universal
```

## Flujo de Trabajo Recomendado

## Flujo Completo para Kubernetes

### **Paso 1: Build de la imagen universal**
```bash
# Una sola vez - construye imagen que sirve para todos los entornos
docker build --build-arg BUILD_ENV=runtime -t bolt-fe:universal .
docker tag bolt-fe:universal logstreamingacrpro.azurecr.io/bolt-revolution-fe:universal
docker push logstreamingacrpro.azurecr.io/bolt-revolution-fe:universal
```

### **Paso 2: Deploy en diferentes entornos**
```bash
# Desarrollo
kubectl apply -f k8s-deployment-dev.yaml  # Con BACKEND_API_URL apuntando a dev

# Producción  
kubectl apply -f k8s-deployment-prod.yaml  # Con BACKEND_API_URL apuntando a prod
```

### **Ventajas del enfoque universal:**
- ✅ **Una sola imagen** sirve para dev, staging, prod
- ✅ **No rebuilds** para cambiar de entorno  
- ✅ **ConfigMaps/Secrets** para URLs por entorno
- ✅ **CI/CD más simple** - build una vez, deploy en múltiples entornos

### **Para desarrollo local:**
- Usar build args específicos si prefieres URLs fijas: `docker build --build-arg BUILD_ENV=dev`

## Ventajas
✅ **Flexibilidad**: Una imagen puede conectar a diferentes backends
✅ **Separación**: Build time vs Runtime configuration
✅ **Kubernetes Ready**: Variables de entorno en deployments
✅ **CI/CD Friendly**: Diferentes entornos sin rebuild