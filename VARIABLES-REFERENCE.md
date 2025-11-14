# Variables de Entorno - Referencia Rápida

## 🎯 **Variables para Kubernetes (las únicas que necesitas)**

### **Ambiente de Desarrollo:**
```yaml
env:
- name: USE_RUNTIME_CONFIG
  value: "true"
- name: BACKEND_URL
  value: "https://bolt-revolution-back-dev.service-insights.com"
- name: BACKEND_API_URL
  value: "https://bolt-revolution-back-dev.service-insights.com/api"
- name: IS_PRODUCTION
  value: "false"
```

### **Ambiente de Producción:**
```yaml
env:
- name: USE_RUNTIME_CONFIG
  value: "true"
- name: BACKEND_URL
  value: "https://bolt-revolution-back.service-insights.com"
- name: BACKEND_API_URL
  value: "https://bolt-revolution-back.service-insights.com/api"
- name: IS_PRODUCTION
  value: "true"
```

## 📋 **Explicación de Variables**

| Variable | Propósito | Ejemplo Dev | Ejemplo Prod |
|----------|-----------|-------------|--------------|
| `USE_RUNTIME_CONFIG` | Activa configuración dinámica | `"true"` | `"true"` |
| `BACKEND_URL` | Nginx proxy (sin /api) | `https://...-dev...` | `https://...prod...` |
| `BACKEND_API_URL` | Angular services (con /api) | `https://...-dev.../api` | `https://...prod.../api` |
| `IS_PRODUCTION` | Flag de producción Angular | `"false"` | `"true"` |

## 🚀 **Comandos Importantes**

### Build imagen universal:
```bash
docker build --build-arg BUILD_ENV=runtime -t bolt-fe:universal .
```

### Deploy en Kubernetes:
```bash
# Desarrollo
kubectl apply -f k8s-deployment-dev.yaml

# Producción  
kubectl apply -f k8s-deployment-prod.yaml
```

## ✅ **Verificación**
- ✅ **Una imagen** funciona para dev y prod
- ✅ **4 variables** controlan todo el comportamiento
- ✅ **Sin variables huérfanas** ni conflictos
- ✅ **Nombres consistentes** en todo el sistema