FROM node:20-alpine

WORKDIR /app

# Configurar variables de entorno
ENV NODE_ENV=production

# 1. Instalar sistema de archivos seguros para npm (https://docs.npmjs.com/cli/v10/configuring-npm/npmrc#package-lock-only)
RUN npm config set package-lock-only true

# 2. Copiar archivos de paquetes y dependencias (sin lockfile por ahora)
COPY package*.json ./

# 3. Limpiar caché de npm para reducir el tamaño de la imagen
RUN npm cache clean --force

# 4. Instalar dependencias de producción (sin devDependencies)
RUN npm install --omit=dev --omit=optional

# Copiar código fuente
COPY . .

# Compilar código TypeScript a JavaScript (dist/)
RUN npm run build

# Exponer puerto Express
EXPOSE 3001

# Asegurar permisos de ejecución para el entrypoint
RUN chmod +x ./entrypoint.sh

# Punto de entrada
ENTRYPOINT ["./entrypoint.sh"]
