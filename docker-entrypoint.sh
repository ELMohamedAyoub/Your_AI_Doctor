#!/bin/sh
set -e

echo "🚀 Starting AI Doctor Agent..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
until pg_isready -h postgres -p 5432 -U ${POSTGRES_USER:-postgres}; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "✅ Database setup complete!"

# Start the application
echo "🎯 Starting Next.js application..."
exec node server.js
