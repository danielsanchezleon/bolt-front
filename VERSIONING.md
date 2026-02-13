# Versionado Automático en Tekton

## Opciones de versionado automático:

### 1. **Usando UID del PipelineRun** (Simple)
```yaml
params:
  - name: IMAGE
    value: logstreamingacrpro.azurecr.io/bolt-revolution-fe:$(context.pipelineRun.uid)
```
- ✅ Automático, único
- ❌ No legible, no relacionado con código

### 2. **Usando SHA del commit** (Recomendado)
```yaml
# Una sola imagen con múltiples tags:
logstreamingacrpro.azurecr.io/bolt-revolution-fe:a1b2c3d     # SHA del commit
logstreamingacrpro.azurecr.io/bolt-revolution-fe:v2.0.1      # Versión semántica
logstreamingacrpro.azurecr.io/bolt-revolution-fe:latest      # Última versión
logstreamingacrpro.azurecr.io/bolt-revolution-fe:stable      # Última estable

## Estrategias de versionado en la industria:

### 1. **Git Tags + Semantic Versioning**
```bash
# Crear un tag en git:
git tag v2.0.1
git push origin v2.0.1

# El pipeline detecta el tag y genera:
# - bolt-revolution-fe:a1b2c3d (SHA)
# - bolt-revolution-fe:v2.0.1 (tag)
# - bolt-revolution-fe:latest (alias)
```

### 2. **Development vs Production**
```bash
# En desarrollo (commits sin tag):
bolt-revolution-fe:a1b2c3d
bolt-revolution-fe:v1.0.5-dev.23  # último tag + número de commits
bolt-revolution-fe:dev

# En producción (con git tag):
bolt-revolution-fe:a1b2c3d
bolt-revolution-fe:v2.0.1
bolt-revolution-fe:latest
bolt-revolution-fe:stable
```

### 3. **Branch-based tagging**
```bash
# main branch:
bolt-revolution-fe:latest
bolt-revolution-fe:v2.0.1

# develop branch:
bolt-revolution-fe:dev
bolt-revolution-fe:v2.0.1-dev.5

# feature branch:
bolt-revolution-fe:feature-login-fix
```
```
- ✅ Trazabilidad completa al código
- ✅ Reproducible
- ✅ Estándar en la industria

### 3. **Usando timestamp**
```yaml
params:
  - name: IMAGE
    value: logstreamingacrpro.azurecr.io/bolt-revolution-fe:$(context.pipelineRun.creationTimestamp)
```

### 4. **Usando variables de entorno**
```bash
# Al ejecutar manualmente:
kubectl apply -f - <<EOF
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  generateName: build-and-push-
spec:
  pipelineRef:
    name: build-and-push-pipeline
  params:
    - name: IMAGE
      value: logstreamingacrpro.azurecr.io/bolt-revolution-fe:$(date +%Y%m%d-%H%M%S)
EOF
```

## Archivos disponibles:

### Básico (solo SHA):
- `get-git-info-task.yaml` - Obtiene SHA del commit
- `pipeline-versioned.yaml` - Pipeline básico con versionado

### Multi-tag (Recomendado):
- `build-and-push-multi-tag-task.yaml` - Task que genera múltiples tags
- Genera: SHA + versión + latest

### Automático basado en git tags:
- `get-version-info-task.yaml` - Detecta git tags automáticamente
- Si hay tag git: usa el tag como versión
- Si no hay tag: genera versión dev automática

## Ejecución:
```bash
# Multi-tag básico:
kubectl apply -f build-and-push-multi-tag-task.yaml
kubectl apply -f pipeline-versioned.yaml
kubectl apply -f pipelinerun-versioned.yaml

# Automático con git tags:
kubectl apply -f get-version-info-task.yaml
# (modificar pipeline para usar get-version-info en lugar de get-git-info)
```

## Mejores prácticas:
1. **Desarrollo**: Usar SHA + dev tags
2. **Release**: Crear git tag → activa pipeline → genera tags oficiales
3. **Rollback**: Usar SHA específico para volver a versión exacta
