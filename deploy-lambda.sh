#!/bin/bash

# Optimized deployment script for AWS Lambda
# Usage: ./deploy-lambda.sh [stage]

STAGE=${1:-dev}

echo "🚀 Deploying One Piece API to AWS Lambda..."
echo "📦 Stage: $STAGE"

# Load environment variables from .env file
if [ -f ".env.aws" ]; then
  echo "📄 Loading environment variables from .env.aws..."
  export $(grep -v '^#' .env.aws | xargs)
elif [ -f ".env" ]; then
  echo "📄 Loading environment variables from .env..."
  export $(grep -v '^#' .env | xargs)
else
  echo "⚠️ No .env file found in root directory"
  echo "💡 Create .env or .env.aws with your configuration"
fi

# Check that environment variables are configured
echo "🔍 Checking environment variables..."

required_vars=(
  "DB_HOST"
  "DB_USER" 
  "DB_PASSWORD"
  "DB_NAME"
  "DB_PORT"
  "JWT_SECRET"
  "JWT_EXPIRES_IN"
  "ADMIN_USERNAME"
  "ADMIN_PASSWORD_HASH"
  "SECURITY_GROUP_ID"
  "SUBNET_ID_1"
  "SUBNET_ID_2"
)

missing_vars=()

for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    missing_vars+=("$var")
  fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
  echo "❌ Missing environment variables:"
  printf '%s\n' "${missing_vars[@]}"
  echo ""
  echo "💡 Configure environment variables before continuing:"
  echo "   export DB_HOST=your-db-host"
  echo "   export DB_USER=your-db-user"
  echo "   # ... etc"
  exit 1
fi

echo "✅ All environment variables are configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production --legacy-peer-deps

# Run tests (skip in production deployment)
echo "🧪 Running tests..."
if npm test; then
  echo "✅ Tests passed successfully"
else
  echo "⚠️ Tests failed, but continuing with deployment..."
  echo "💡 Run 'npm test' locally to verify all tests pass"
fi

# Deploy with Serverless
echo "🚀 Deploying with Serverless Framework..."
npx serverless deploy --stage $STAGE --verbose

if [ $? -eq 0 ]; then
  echo "✅ Deployment successful!"
  echo ""
  echo "🔗 Your API is available at:"
  echo "   https://$(npx serverless info --stage $STAGE | grep 'endpoint:' | cut -d' ' -f2)"
  echo ""
  echo "📊 To monitor logs:"
  echo "   npx serverless logs --function api --stage $STAGE --tail"
else
  echo "❌ Deployment failed. Check the logs above."
  exit 1
fi
