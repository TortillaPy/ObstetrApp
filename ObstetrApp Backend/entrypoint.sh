#!/bin/sh
set -e

echo "🚀 Iniciando proceso de arranque del backend..."

# Si DATABASE_URL es PostgreSQL, usamos el esquema de PostgreSQL
if [ -n "$DATABASE_URL" ] && echo "$DATABASE_URL" | grep -qE "postgres(ql)?://"; then
  echo "🐘 Detectada conexión a PostgreSQL. Aplicando esquema de PostgreSQL..."
  cp prisma/schema.postgresql.prisma prisma/schema.prisma
fi

echo "🔄 Generando cliente Prisma..."
npx prisma generate

echo "🗄️ Sincronizando esquema de base de datos..."
npx prisma db push

echo "⚡ Iniciando servidor de producción Express..."
exec node dist/index.js
