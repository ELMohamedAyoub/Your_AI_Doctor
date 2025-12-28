#!/bin/bash

# Post-Surgery Monitoring Platform - Database Setup Script

echo "=================================="
echo "Database Setup Script"
echo "=================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file based on .env.example"
    echo ""
    echo "Copying .env.example to .env..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env and add your database credentials and API keys"
    echo ""
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env; then
    echo "❌ Error: DATABASE_URL not set in .env"
    echo "Please add your PostgreSQL database URL to .env"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔧 Generating Prisma Client..."
npx prisma generate

echo ""
echo "🗄️  Running database migration..."
npx prisma migrate dev --name add_patient_session_alert_models

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Sign in and complete patient onboarding"
echo ""
echo "Optional:"
echo "- View database: npx prisma studio"
echo "- Reset database: npx prisma migrate reset"
echo ""
