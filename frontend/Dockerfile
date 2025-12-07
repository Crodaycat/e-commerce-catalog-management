# ===============================================
# ETAPA 1: BUILD (Construcción)
# Esta etapa instala dependencias y compila la aplicación
# ===============================================
FROM node:20-slim AS builder

# 1. Directorio de trabajo
WORKDIR /app

# 2. Copiar archivos esenciales para la instalación de dependencias
# Esto optimiza el caché de Docker. Si package.json/lockfile no cambian,
# no se reinstalan los node_modules.
COPY package.json package-lock.json* ./

# 3. Instalar dependencias
RUN npm install

# 4. Copiar todos los archivos fuente (código)
COPY . .

# 5. Compilar la aplicación para producción
# Esto genera el directorio .next con los archivos optimizados
RUN npm run build


# ===============================================
# ETAPA 2: PRODUCTION (Producción - Imagen final)
# Usa una imagen base mínima para ejecutar la aplicación compilada
# ===============================================
FROM node:20-slim AS runner

# 1. Establecer el usuario que ejecutará la app por razones de seguridad
# Si no necesitas permisos especiales, ejecutar como usuario 'node' es más seguro.
USER node

# 2. Directorio de trabajo
WORKDIR /app

# 3. Copiar archivos de producción de la etapa 'builder'
# Copiamos solo lo esencial para ejecutar la app:
# a) package.json (para obtener el comando 'start')
# b) next.config.js (si existe)
# c) .next (la compilación)
# d) public (archivos estáticos)
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=builder --chown=node:node /app/next.config.mjs ./next.config.mjs
# Si usas middleware o código que se necesita en runtime, copia esos archivos también:
# COPY --from=builder --chown=node:node /app/middleware.ts ./middleware.ts

# 4. Exponer el puerto (Next.js usa 3000 por defecto)
EXPOSE 3000

# 5. Comando de ejecución (modo producción)
CMD ["npm", "start"]