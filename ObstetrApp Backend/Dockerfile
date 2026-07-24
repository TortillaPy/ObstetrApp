FROM node:20-alpine

WORKDIR /app

# Copiar archivos de paquetes y dependencias
COPY package*.json ./

# Instalar dependencias (incluyendo typescript para compilar dist/)
RUN npm install

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
