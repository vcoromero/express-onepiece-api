# make-commits: Script para Commits Convencionales y Atómicos

Este documento describe cómo usar el script `make-commits` para crear commits convencionales y atómicos en el proyecto.

## 🚀 Uso Básico

```bash
./make-commits [tipo] [descripción] [archivos...]
```

### Ejemplos

```bash
# Nueva funcionalidad
./make-commits feat "add user authentication" src/auth/

# Corrección de bug
./make-commits fix "resolve database connection issue" src/config/db.config.js

# Documentación
./make-commits docs "update API documentation" docs/

# Cambios de formato
./make-commits style "fix code formatting" src/controllers/

# Refactorización
./make-commits refactor "extract common utilities" src/utils/

# Tests
./make-commits test "add unit tests for auth service" __tests__/services/

# Dependencias
./make-commits chore "update dependencies" package.json package-lock.json
```

## 📋 Tipos de Commit

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `feat` | Nueva funcionalidad | `feat: add user registration endpoint` |
| `fix` | Corrección de bugs | `fix: resolve memory leak in cache` |
| `docs` | Cambios en documentación | `docs: update API documentation` |
| `style` | Cambios de formato, espacios, etc. | `style: fix indentation in controllers` |
| `refactor` | Refactorización de código | `refactor: extract database connection logic` |
| `test` | Agregar o modificar tests | `test: add integration tests for auth` |
| `chore` | Cambios en build, dependencias, etc. | `chore: update eslint configuration` |
| `perf` | Mejoras de rendimiento | `perf: optimize database queries` |
| `ci` | Cambios en CI/CD | `ci: add automated testing pipeline` |
| `build` | Cambios en sistema de build | `build: update webpack configuration` |

## 🛠️ Opciones Disponibles

### `-h, --help`
Muestra la ayuda completa del script.

```bash
./make-commits --help
```

### `-s, --status`
Muestra el estado actual del repositorio.

```bash
./make-commits --status
```

### `-d, --dry-run`
Muestra qué se haría sin ejecutar realmente el commit.

```bash
./make-commits --dry-run feat "add new feature" src/controllers/new.controller.js
```

## 📁 Gestión de Archivos

### Archivos Específicos
```bash
./make-commits feat "add new controller" src/controllers/user.controller.js
```

### Múltiples Archivos
```bash
./make-commits feat "add user management" src/controllers/user.controller.js src/services/user.service.js src/routes/user.routes.js
```

### Directorios Completos
```bash
./make-commits feat "add authentication module" src/auth/
```

### Sin Archivos Específicos
Si no especificas archivos, el script usará todos los cambios pendientes:

```bash
./make-commits feat "add new feature"
```

## ✅ Validaciones

El script incluye varias validaciones:

- ✅ Verifica que estés en un repositorio git
- ✅ Valida que el tipo de commit sea válido
- ✅ Verifica que los archivos especificados existan
- ✅ Confirma que hay cambios para commitear

## 🎯 Mejores Prácticas

### 1. Commits Atómicos
Cada commit debe representar un cambio lógico completo:

```bash
# ✅ Bueno: Un cambio específico
./make-commits feat "add user login endpoint" src/controllers/auth.controller.js

# ❌ Malo: Múltiples cambios no relacionados
./make-commits feat "add login and fix database and update docs" src/
```

### 2. Descripciones Claras
Usa descripciones concisas pero descriptivas:

```bash
# ✅ Bueno
./make-commits fix "resolve null pointer exception in user service"

# ❌ Malo
./make-commits fix "fix bug"
```

### 3. Archivos Relacionados
Agrupa archivos que están relacionados lógicamente:

```bash
# ✅ Bueno: Archivos relacionados
./make-commits feat "add user authentication" src/controllers/auth.controller.js src/services/auth.service.js src/routes/auth.routes.js

# ❌ Malo: Archivos no relacionados
./make-commits feat "add features" src/controllers/auth.controller.js src/controllers/ship.controller.js docs/README.md
```

## 🔍 Ejemplos Avanzados

### Desarrollo de Feature Completa
```bash
# 1. Crear modelos
./make-commits feat "add user model" src/models/user.model.js

# 2. Crear servicios
./make-commits feat "add user service" src/services/user.service.js

# 3. Crear controladores
./make-commits feat "add user controller" src/controllers/user.controller.js

# 4. Crear rutas
./make-commits feat "add user routes" src/routes/user.routes.js

# 5. Agregar tests
./make-commits test "add user service tests" __tests__/services/user.service.test.js
```

### Corrección de Bug
```bash
# 1. Identificar el problema
./make-commits --status

# 2. Hacer los cambios
# ... editar archivos ...

# 3. Commitear la corrección
./make-commits fix "resolve database connection timeout" src/config/db.config.js

# 4. Agregar test para prevenir regresión
./make-commits test "add test for database connection timeout" __tests__/config/db.config.test.js
```

### Refactorización
```bash
# 1. Extraer utilidades comunes
./make-commits refactor "extract database connection logic" src/utils/db.util.js

# 2. Actualizar controladores para usar utilidades
./make-commits refactor "update controllers to use db utilities" src/controllers/

# 3. Actualizar tests
./make-commits test "update tests for refactored database logic" __tests__/
```

## 🚨 Solución de Problemas

### Error: "No estás en un repositorio git"
```bash
# Verifica que estés en el directorio correcto
pwd
ls -la .git

# Si no existe, inicializa el repositorio
git init
```

### Error: "Tipo de commit inválido"
```bash
# Usa solo los tipos válidos
./make-commits --help  # Ver tipos disponibles
```

### Error: "Archivos no encontrados"
```bash
# Verifica que los archivos existan
ls -la src/controllers/new.controller.js

# O usa rutas relativas correctas
./make-commits feat "add feature" ./src/controllers/new.controller.js
```

### Error: "No hay cambios para commitear"
```bash
# Verifica el estado del repositorio
./make-commits --status

# O agrega archivos manualmente
git add src/controllers/new.controller.js
./make-commits feat "add feature"
```

## 📚 Recursos Adicionales

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project)
- [Semantic Versioning](https://semver.org/)

---

**Nota:** Este script está diseñado para facilitar la creación de commits consistentes y bien estructurados. Siempre revisa los cambios antes de hacer commit usando `git diff` o `./make-commits --dry-run`.
