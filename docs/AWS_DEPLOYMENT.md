# AWS Deployment Guide - One Piece API

## 📋 Table of Contents

1. [Why AWS](#why-aws)
2. [Deployment Options](#deployment-options)
3. [Recommended Configuration](#recommended-configuration)
4. [CloudWatch Integration](#cloudwatch-integration)
5. [Estimated Costs](#estimated-costs)
6. [Security](#security)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Why AWS

This API is optimized for AWS with built-in features for:
- **💰 Cost Control** - Rate limiting prevents attacks that could generate excessive charges
- **📊 Monitoring** - Winston logger integrated with CloudWatch
- **🔒 Security** - Production best practices
- **📈 Scalability** - Ready for auto-scaling configurations

---

## 🎯 Deployment Options

### Option 1: AWS Elastic Beanstalk (⭐ Recommended for beginners)

**Pros:**
- Easiest setup
- Automatic auto-scaling
- Load balancing included
- Managed updates

**Steps:**

```bash
# 1. Install EB CLI
pip install awsebcli

# 2. Initialize
eb init -p node.js one-piece-api

# 3. Create environment
eb create one-piece-api-env

# 4. Configure environment variables
eb setenv \
  JWT_SECRET=your_secure_secret_here \
  ADMIN_USERNAME=admin \
  ADMIN_PASSWORD_HASH=your_hash_here \
  DB_HOST=your_rds_endpoint \
  DB_USER=admin \
  DB_PASSWORD=your_db_password \
  DB_NAME=onepiece_db \
  NODE_ENV=production

# 5. Deploy
eb deploy

# 6. Open in browser
eb open
```

**Estimated cost:** ~$25-50/month (t3.micro)

---

### Option 2: AWS Lambda + API Gateway (⭐ Cheapest for low traffic)

**Pros:**
- Pay per use (only pay for requests)
- Infinite auto-scaling
- No server management
- Generous free tier

**Steps:**

```bash
# 1. Install Serverless Framework
npm install -g serverless

# 2. Create serverless.yml
cat > serverless.yml << 'EOF'
service: onepiece-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    NODE_ENV: production
    JWT_SECRET: ${env:JWT_SECRET}
    ADMIN_USERNAME: ${env:ADMIN_USERNAME}
    ADMIN_PASSWORD_HASH: ${env:ADMIN_PASSWORD_HASH}
    DB_HOST: ${env:DB_HOST}
    DB_USER: ${env:DB_USER}
    DB_PASSWORD: ${env:DB_PASSWORD}
    DB_NAME: ${env:DB_NAME}

functions:
  app:
    handler: lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
      - http:
          path: /
          method: ANY
          cors: true
EOF

# 3. Create lambda.js
cat > lambda.js << 'EOF'
const serverless = require('serverless-http');
const app = require('./src/app');

module.exports.handler = serverless(app);
EOF

# 4. Install serverless-http
npm install serverless-http

# 5. Deploy
serverless deploy --stage production
```

**Estimated cost:** ~$0-5/month (1M requests = $3.50)

---

### Option 3: AWS ECS + Fargate (⭐ Best for containers)

**Pros:**
- Uses Docker (portability)
- Full control
- Easy auto-scaling
- No server management

**Steps:**

```bash
# 1. Build Docker image
docker build -t onepiece-api .

# 2. Create ECR repository
aws ecr create-repository --repository-name onepiece-api

# 3. Login to ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com

# 4. Tag and push
docker tag onepiece-api:latest YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/onepiece-api:latest
docker push YOUR_ACCOUNT.dkr.ecr.us-east-1.amazonaws.com/onepiece-api:latest

# 5. Create task definition and service in ECS Console
# (Or use AWS CLI/Terraform)
```

**Estimated cost:** ~$15-30/month (Fargate minimal)

---

### Option 4: AWS EC2 (Traditional)

**Pros:**
- Full control
- Familiar approach
- Free tier available

**Steps:**

```bash
# 1. Launch EC2 instance (t2.micro for free tier)

# 2. SSH to server
ssh -i your-key.pem ec2-user@your-instance-ip

# 3. Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs git

# 4. Clone repo
git clone your-repo
cd express-onepiece-api

# 5. Install dependencies
npm install

# 6. Setup PM2
sudo npm install -g pm2
pm2 start src/index.js --name onepiece-api
pm2 startup
pm2 save

# 7. Configure Nginx (optional)
sudo yum install -y nginx
# Configure reverse proxy
```

**Estimated cost:** ~$0-10/month (t2.micro free tier)

---

## ⚙️ Recommended Configuration

### Environment Variables for Production

```env
# Server
PORT=3000
NODE_ENV=production

# Database (use RDS)
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=your_secure_password
DB_NAME=onepiece_db
DB_PORT=3306

# Security (CRITICAL)
JWT_SECRET=generate_64_char_random_string_here
JWT_EXPIRES_IN=1h

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$your_production_hash

# Rate Limiting (PROTECTS YOUR WALLET)
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=50        # Stricter in production
RATE_LIMIT_LOGIN_MAX=3            # Only 3 login attempts

# Logging
LOG_LEVEL=info                    # Balance between detail and cost
LOG_HTTP_REQUESTS=false           # Disable to reduce volume
```

### Generate Secure JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 📊 CloudWatch Integration

Winston logger works automatically with CloudWatch when deployed on AWS.

### Setup CloudWatch Logs

**For EC2/Elastic Beanstalk:**

```bash
# 1. Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# 2. Configure agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# 3. Start agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s -c file:/opt/aws/amazon-cloudwatch-agent/bin/config.json
```

**For ECS/Fargate:**
- Logs are automatically sent to CloudWatch
- Configure log retention in AWS console

**For Lambda:**
- Automatic logs in `/aws/lambda/function-name`

### View Logs

```bash
# AWS CLI
aws logs tail /aws/elasticbeanstalk/one-piece-api --follow

# Or use CloudWatch Console
# https://console.aws.amazon.com/cloudwatch/
```

### Create Alarms

Configure alerts for:

```bash
# High error rate
aws cloudwatch put-metric-alarm \
  --alarm-name onepiece-api-high-errors \
  --alarm-description "Alert when error rate exceeds threshold" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --evaluation-periods 1 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold

# Login failures
# (Custom metric from app)

# Rate limit triggers
# (Custom metric from app)
```

---

## 💰 Estimated Costs

| Service | Configuration | Monthly Cost |
|---------|---------------|--------------|
| **Lambda + API Gateway** | 1M requests/month | $3-5 |
| **Elastic Beanstalk** | t3.micro, 24/7 | $25-40 |
| **ECS Fargate** | 0.25 vCPU, 0.5GB | $15-25 |
| **EC2 t2.micro** | Free tier or paid | $0-8 |
| **RDS t3.micro** | MySQL 20GB | $15-20 |
| **CloudWatch Logs** | 5GB/month | Free |
| **Data Transfer** | <15GB/month | Free |

**Total for small project:** $10-50/month

### Cost Optimization Tips

1. ✅ **Enable rate limiting** - Prevents runaway costs from attacks
2. ✅ **Set CloudWatch log retention** - 7-30 days, not indefinite
3. ✅ **Use free tier** - 12 months free for new accounts
4. ✅ **Auto-scaling schedule** - Turn off instances at night if not needed
5. ✅ **Lambda for low traffic** - Cheaper than always-on servers
6. ✅ **Reserved Instances** - 40% discount if you know you'll use 1+ year

---

## 🔒 Security

### Security Checklist

- ✅ **Rate limiting enabled** - Protects costs and prevents abuse
- ✅ **HTTPS enabled** - Use ALB, CloudFront, or API Gateway
- ✅ **Security groups** - Only necessary ports (80, 443, 3306)
- ✅ **IAM roles** - Least privilege principle
- ✅ **Secrets Manager** - DON'T use .env in production, use AWS Secrets Manager
- ✅ **CloudWatch Alarms** - Alerts for anomalies
- ✅ **Auto-scaling** - Handle traffic spikes
- ✅ **RDS backups** - Automated backups enabled
- ✅ **VPC** - Database in private subnet
- ✅ **WAF** - Web Application Firewall (optional, $5-10/month)

### Use AWS Secrets Manager

```javascript
// Instead of .env, load secrets from AWS
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getSecret(secretName) {
  try {
    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
    return JSON.parse(data.SecretString);
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

// Usage
const secrets = await getSecret('onepiece-api/production');
const jwtSecret = secrets.JWT_SECRET;
```

---

## 🐛 Troubleshooting

### Error: Cannot connect to RDS

**Cause:** Security group doesn't allow connections from your app

**Solution:**
1. Go to RDS Console → Your DB → Connectivity & security
2. Click on the security group
3. Edit inbound rules
4. Add rule: Type=MySQL/Aurora, Source=Your app's security group

### Error: 502 Bad Gateway

**Cause:** App not listening on correct port

**Solution:**
```javascript
// Make sure your app uses process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0'); // ← Important: '0.0.0.0' not 'localhost'
```

### Logs not appearing in CloudWatch

**Cause:** IAM role missing permissions

**Solution:**
Add this policy to IAM role:
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ],
    "Resource": "arn:aws:logs:*:*:*"
  }]
}
```

### Very high costs

**Cause:** Possible attack or rate limiting not configured

**Solution:**
1. Check CloudWatch metrics for unusual traffic
2. Review logs for suspicious IPs
3. Configure WAF to block IPs
4. Enable stricter rate limiting

---

## 🎯 Next Steps

After deploying to AWS:

1. **Deploy frontend** (Nuxt.js)
   - Option A: S3 + CloudFront (cheapest)
   - Option B: AWS Amplify (easiest)

2. **Configure CORS** for your domain
   ```javascript
   app.use(cors({
     origin: 'https://your-frontend-domain.com',
     credentials: true
   }));
   ```

3. **Setup CI/CD**
   - GitHub Actions → AWS
   - Automatic deploy on push to main

4. **Add custom domain**
   - Route 53 for DNS
   - Certificate Manager for SSL

5. **Monitoring & Alerts**
   - Configure CloudWatch dashboards
   - Setup SNS for notifications

---

## 📚 Resources

- [AWS Elastic Beanstalk Docs](https://docs.aws.amazon.com/elasticbeanstalk/)
- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [Serverless Framework](https://www.serverless.com/framework/docs/)
- [AWS Free Tier](https://aws.amazon.com/free/)
- [CloudWatch Logs](https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/)

---

**Questions?** Open an issue in the repo or check AWS documentation.
