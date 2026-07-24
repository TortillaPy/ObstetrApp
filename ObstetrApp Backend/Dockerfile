FROM node:20-alpine

WORKDIR /app

# Instalar OpenSSL para compatibilidad del Query Engine de Prisma en Alpine Linux
RUN apk add --no-cache openssl

# Copiar archivos de paquetes y dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo typescript para compilar dist/)
RUN npm install --legacy-peer-deps

# Copiar código fuente
COPY . .

# Preparar Prisma y compilar TypeScript
RUN cp prisma/schema.postgresql.prisma prisma/schema.prisma && npx prisma generate
RUN npm run build

# Exponer puerto Express
EXPOSE 3001

# Asegurar permisos de ejecución para el entrypoint
RUN chmod +x ./entrypoint.sh

# Punto de entrada
ENTRYPOINT ["./entrypoint.sh"]
