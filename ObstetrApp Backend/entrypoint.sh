#!/bin/sh
set -e

echo "🚀 Iniciando proceso de arranque del backend..."

# Si DATABASE_URL es PostgreSQL, usamos el esquema de PostgreSQL
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -qE "postgres(ql)?://"; then
  echo "🐘 Detectada conexión a PostgreSQL. Aplicando esquema de PostgreSQL..."
  cp prisma/schema.postgresql.prisma prisma/schema.prisma
fi

echo "🗄️ Esperando y sincronizando esquema de base de datos..."
max_retries=10
count=0
until npx prisma db push --skip-generate || [ $count -eq $max_retries ]; do
  count=$((count+1))
  echo "⏳ Esperando respuesta de la base de datos (intento $count/$max_retries)..."
  sleep 2
done

echo "🌱 Ejecutando siembra inicial de la base de datos..."
node dist/seed.js || true

echo "⚡ Iniciando servidor de producción Express..."
exec node dist/index.js
