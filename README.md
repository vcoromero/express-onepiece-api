# One Piece API

A RESTful API inspired by One Piece, built with Express.js and MySQL.

## Technologies

- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Jest** - Unit testing
- **ESLint** - Code quality
- **Docker** - Containerization

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- Docker (optional, for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd express-onepiece-api
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

All environment files are located in `configs/` directory:

```bash
configs/.env              # Your local development (already created with defaults)
configs/.env.test         # Test environment (already created)
configs/.env.qa           # QA environment template
configs/.env.production   # Production environment template
```

Edit `configs/.env` with your local values if needed. See `configs/README.md` for detailed configuration guide.

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run unit tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run audit` - Run security audit
- `npm run audit:fix` - Fix security vulnerabilities
- `npm run lint` - Check code quality
- `npm run lint:fix` - Fix linting issues

## Docker

Build and run with Docker:
```bash
docker build -t onepiece-api .
docker run -p 3000:3000 --env-file .env onepiece-api
```

## AWS Deployment

This API is optimized for AWS cloud deployment with built-in features for cost control and monitoring.

### Why Rate Limiting & Logging are Critical for AWS

**💰 Cost Control:**
- Without rate limiting, DDoS attacks could cost you hundreds/thousands in AWS charges
- Rate limiting protects against:
  - High EC2/Lambda compute costs
  - Excessive RDS connections
  - Data transfer charges
  - CloudWatch log storage costs

**📊 Monitoring & Debugging:**
- Winston logger integrates natively with AWS CloudWatch
- Track security events, errors, and usage patterns
- Set up CloudWatch Alarms for anomalies
- Debug production issues without SSH access

### AWS Deployment Options

#### Option 1: AWS Elastic Beanstalk (Easiest)
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init -p node.js one-piece-api
eb create one-piece-api-env
eb setenv JWT_SECRET=your_secret ADMIN_USERNAME=admin ADMIN_PASSWORD_HASH=your_hash
eb open
```

**Pros:** Automatic load balancing, auto-scaling, managed updates
**Cost:** ~$25-50/month (t2.micro)

#### Option 2: AWS Lambda + API Gateway (Serverless)
```bash
# Install Serverless Framework
npm install -g serverless

# Deploy
serverless deploy --stage production
```

**Pros:** Pay only for requests, auto-scales, no server management
**Cost:** ~$0-5/month for low traffic (free tier eligible)

#### Option 3: AWS ECS + Fargate (Container-based)
```bash
# Build and push Docker image
docker build -t onepiece-api .
docker tag onepiece-api:latest YOUR_ECR_REPO/onepiece-api:latest
docker push YOUR_ECR_REPO/onepiece-api:latest

# Deploy with ECS
aws ecs update-service --cluster your-cluster --service onepiece-api --force-new-deployment
```

**Pros:** Full control, easy scaling, Docker-based
**Cost:** ~$15-30/month (Fargate minimal)

#### Option 4: AWS EC2 (Traditional)
```bash
# SSH into EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Clone and setup
git clone your-repo
cd express-onepiece-api
npm install
pm2 start src/index.js --name onepiece-api
pm2 startup
pm2 save
```

**Pros:** Full control, familiar deployment
**Cost:** ~$5-10/month (t2.micro free tier)

### AWS Configuration Recommendations

**For Production on AWS:**

```env
# Strict rate limiting (protect your wallet!)
RATE_LIMIT_MAX_REQUESTS=50      # Lower = better protection
RATE_LIMIT_LOGIN_MAX=3          # Prevent brute force

# Logging for CloudWatch
LOG_LEVEL=info                  # Balance detail vs cost
LOG_HTTP_REQUESTS=false         # Disable to reduce log volume

# Security
JWT_EXPIRES_IN=1h               # Shorter tokens = more secure
NODE_ENV=production
```

### CloudWatch Integration

Winston logs automatically work with CloudWatch when deployed to AWS:

**Setup CloudWatch Logs (EC2/ECS/Beanstalk):**
1. Install CloudWatch agent or use AWS-provided logging
2. Logs in `logs/` directory are automatically shipped to CloudWatch
3. Set retention policy to control costs (7-30 days recommended)

**View logs:**
```bash
# AWS CLI
aws logs tail /aws/elasticbeanstalk/one-piece-api/var/log/nodejs/nodejs.log --follow

# Or use CloudWatch Console
```

**Create Alarms:**
- Alert on error rate > X per minute
- Alert on login failures > Y per hour
- Alert on rate limit triggers > Z per hour

### Cost Optimization Tips

1. **Enable rate limiting** (prevents runaway costs)
2. **Use CloudWatch Logs Insights** (query logs efficiently)
3. **Set log retention** (7-30 days, not indefinite)
4. **Monitor with CloudWatch Alarms** (get notified early)
5. **Use AWS Free Tier** (12 months free for new accounts)
6. **Consider Lambda** (for low traffic, very cheap)
7. **Enable auto-scaling** (scale down when not in use)

### Expected AWS Costs (Rough Estimates)

| Service | Configuration | Monthly Cost |
|---------|--------------|--------------|
| **Lambda + API Gateway** | 1M requests/month | $3-5 |
| **Elastic Beanstalk** | t3.micro, 24/7 | $25-40 |
| **ECS Fargate** | 0.25 vCPU, 0.5GB | $15-25 |
| **EC2 t2.micro** | Free tier or $8/month | $0-8 |
| **RDS t3.micro** | MySQL 20GB | $15-20 |
| **CloudWatch Logs** | 5GB/month | Free |
| **Data Transfer** | <15GB/month | Free |

**Total for small project:** $10-50/month depending on traffic and setup

### Security Checklist for AWS

- ✅ Rate limiting enabled (protects costs)
- ✅ HTTPS enabled (use ALB or CloudFront)
- ✅ Security groups configured (restrict ports)
- ✅ IAM roles with least privilege
- ✅ Secrets in AWS Secrets Manager (not .env)
- ✅ CloudWatch Alarms configured
- ✅ Auto-scaling enabled
- ✅ Backups configured (RDS automated backups)

### Next Steps After AWS Deployment

1. **Set up your Nuxt.js client** (frontend)
2. **Deploy client to AWS** (S3 + CloudFront or Amplify)
3. **Connect frontend to API**
4. **Configure CORS** for your domain
5. **Set up CI/CD** (GitHub Actions → AWS)

## API Endpoints

### Health Check

- **GET** `/api/health`
  - Returns API health status
  - Public access (no authentication required)

### Authentication

#### Login
- **POST** `/api/auth/login`
  - Authenticate admin user and receive JWT token
  - **Body:**
    ```json
    {
      "username": "admin",
      "password": "your_password"
    }
    ```
  - **Response:**
    ```json
    {
      "success": true,
      "message": "Login successful",
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": "24h",
        "user": {
          "username": "admin",
          "role": "admin"
        }
      }
    }
    ```

#### Verify Token
- **GET** `/api/auth/verify`
  - Verify if a JWT token is valid
  - **Requires authentication**
  - **Headers:** `Authorization: Bearer <token>`

#### Generate Password Hash (Development/Test Only)
- **POST** `/api/auth/generate-hash`
  - Generate bcrypt hash for a password
  - **Only available in NODE_ENV=development or test**
  - **Not available in production**
  - **Body:**
    ```json
    {
      "password": "your_secure_password"
    }
    ```

## Authentication & Authorization

This API uses JWT (JSON Web Tokens) for authentication.

### Quick Start

1. **Generate password hash:**
```bash
# Start the dev server
npm run dev

# Generate hash
curl -X POST http://localhost:3000/api/auth/generate-hash \
  -H "Content-Type: application/json" \
  -d '{"password": "your_secure_password"}'
```

2. **Update .env with the hash:**
```env
ADMIN_PASSWORD_HASH=$2a$10$...  # Use the hash from step 1
```

3. **Login and get token:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_secure_password"}'
```

4. **Use token in protected routes:**
```bash
curl -X GET http://localhost:3000/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Protecting Routes

To protect your routes, add the auth middleware:

```javascript
const authMiddleware = require('./middlewares/auth.middleware');

// Public routes (no authentication)
router.get('/items', itemController.getAll);

// Protected routes (authentication required)
router.post('/items', authMiddleware, itemController.create);
router.put('/items/:id', authMiddleware, itemController.update);
router.delete('/items/:id', authMiddleware, itemController.delete);
```

### Security Best Practices

- ✅ Use strong, unique passwords
- ✅ Change `JWT_SECRET` to a long random string (64+ characters)
- ✅ Set appropriate token expiration times
- ✅ Never commit `.env` file (already in `.gitignore`)
- ✅ Remove `/api/auth/generate-hash` endpoint in production
- ✅ Use HTTPS in production

## Testing

Run the test suite:
```bash
npm test
```

View coverage report:
```bash
npm test -- --coverage
```

## Postman Collection

Import the `onepiece-api.postman_collection.json` file into Postman to test the API endpoints.

## Project Structure

```
express-onepiece-api/
├── src/
│   ├── controllers/      # API controllers
│   │   ├── auth.controller.js
│   │   └── health.controller.js
│   ├── routes/          # Route definitions
│   │   ├── auth.routes.js
│   │   └── health.routes.js
│   ├── middlewares/     # Custom middlewares
│   │   ├── auth.middleware.js
│   │   └── rate-limiter.js
│   ├── utils/           # Utilities and helpers
│   │   ├── jwt.util.js
│   │   └── logger.js
│   ├── app.js          # Express configuration
│   └── index.js        # Entry point
├── __tests__/          # Unit tests (22 tests)
│   ├── auth.test.js
│   ├── health.test.js
│   └── rate-limiter.test.js
├── configs/            # Environment configuration
│   ├── .env            # Local development (not committed)
│   ├── .env.test       # Test environment (not committed)
│   ├── .env.qa         # QA template
│   ├── .env.production # Production template
│   ├── .env.example    # Template reference
│   └── README.md       # Configuration guide
├── database/           # Database scripts
│   └── schema.sql
├── logs/               # Application logs (not committed)
│   ├── combined.log
│   ├── error.log
│   └── security.log
├── jest.setup.js       # Jest test configuration
├── Dockerfile
├── package.json
└── README.md
```

## License

MIT
