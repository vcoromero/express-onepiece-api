# 🚀 Deployment Guide

## AWS Lambda Deployment

This API is designed for serverless deployment on AWS Lambda with API Gateway.

## Prerequisites

- AWS CLI configured
- Node.js 18+
- Serverless Framework
- AWS Account with appropriate permissions

## Architecture

```
Internet → API Gateway → Lambda Function → RDS MySQL
```

### Components
- **API Gateway**: HTTP API management
- **Lambda**: Serverless compute
- **RDS MySQL**: Managed database
- **Secrets Manager**: Secure configuration
- **CloudWatch**: Monitoring and logging

## Deployment Steps

### 1. Install Dependencies

```bash
npm install -g serverless
npm install
```

### 2. Configure AWS Credentials

```bash
aws configure
# Enter your AWS Access Key ID
# Enter your AWS Secret Access Key
# Enter your default region (e.g., us-east-1)
```

### 3. Set Up RDS Database

```bash
# Create RDS MySQL instance
aws rds create-db-instance \
  --db-instance-identifier onepiece-api-db \
  --db-instance-class db.t3.micro \
  --engine mysql \
  --master-username admin \
  --master-user-password YourSecurePassword \
  --allocated-storage 20
```

### 4. Configure Secrets Manager

```bash
# Store database credentials
aws secretsmanager create-secret \
  --name onepiece-api/database \
  --secret-string '{
    "DB_HOST": "your-rds-endpoint.amazonaws.com",
    "DB_USER": "admin",
    "DB_PASSWORD": "YourSecurePassword",
    "DB_NAME": "onepiece_db",
    "DB_PORT": "3306"
  }'
```

### 5. Deploy to AWS

```bash
# Deploy the application
serverless deploy

# Deploy to specific stage
serverless deploy --stage production
```

## Configuration Files

### serverless.yml
```yaml
service: express-onepiece-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  
  environment:
    NODE_ENV: production
    
  iamRoleStatements:
    - Effect: Allow
      Action:
        - secretsmanager:GetSecretValue
      Resource: "*"

functions:
  api:
    handler: src/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
```

### Environment Variables

#### Production (.env.aws)
```env
NODE_ENV=production
DB_HOST=your-rds-endpoint.amazonaws.com
DB_USER=admin
DB_PASSWORD=YourSecurePassword
DB_NAME=onepiece_db
DB_PORT=3306
JWT_SECRET=your-production-secret
JWT_EXPIRES_IN=24h
```

## Database Setup on AWS

### 1. Connect to RDS Instance

```bash
mysql -h your-rds-endpoint.amazonaws.com -u admin -p
```

### 2. Create Database

```sql
CREATE DATABASE onepiece_db;
USE onepiece_db;
```

### 3. Execute Schema Files

```bash
# Upload and execute schema files
for file in database/schemas/*.sql; do
  mysql -h your-rds-endpoint.amazonaws.com -u admin -p onepiece_db < "$file"
done
```

## Monitoring and Logs

### CloudWatch Logs
```bash
# View Lambda logs
aws logs describe-log-groups --log-group-name-prefix /aws/lambda/express-onepiece-api

# View recent logs
aws logs get-log-events --log-group-name /aws/lambda/express-onepiece-api-api --log-stream-name $(aws logs describe-log-streams --log-group-name /aws/lambda/express-onepiece-api-api --order-by LastEventTime --descending --max-items 1 --query 'logStreams[0].logStreamName' --output text)
```

### CloudWatch Metrics
- **Invocations**: Number of function calls
- **Duration**: Function execution time
- **Errors**: Error rate and count
- **Throttles**: Function throttling

## Security Considerations

### 1. IAM Roles
- Minimal permissions for Lambda function
- Secrets Manager access only
- No direct RDS access (use connection pooling)

### 2. Network Security
- VPC configuration for RDS
- Security groups for database access
- API Gateway throttling

### 3. Secrets Management
- Database credentials in Secrets Manager
- JWT secrets in environment variables
- No hardcoded credentials

## Performance Optimization

### 1. Connection Pooling
```javascript
// Configure connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
});
```

### 2. Cold Start Mitigation
- Keep connections alive
- Optimize package size
- Use provisioned concurrency for critical functions

### 3. Caching
- RDS Proxy for connection pooling
- CloudFront for static content
- Lambda@Edge for edge computing

## Troubleshooting

### Common Issues

#### 1. Database Connection Timeout
```bash
# Check RDS security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Verify Lambda VPC configuration
aws lambda get-function-configuration --function-name express-onepiece-api-api
```

#### 2. Cold Start Issues
```bash
# Monitor function duration
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration \
  --dimensions Name=FunctionName,Value=express-onepiece-api-api \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Average
```

#### 3. Memory Issues
```bash
# Check function memory usage
aws lambda get-function-configuration --function-name express-onepiece-api-api --query 'MemorySize'
```

## Cost Optimization

### 1. Lambda Configuration
- Right-size memory allocation
- Use appropriate timeout values
- Monitor and optimize cold starts

### 2. RDS Optimization
- Use appropriate instance class
- Enable automated backups
- Monitor storage usage

### 3. API Gateway
- Use HTTP API instead of REST API for cost savings
- Implement proper caching
- Monitor request patterns

## Rollback Procedures

### 1. Function Rollback
```bash
# List previous versions
aws lambda list-versions-by-function --function-name express-onepiece-api-api

# Rollback to previous version
aws lambda update-alias --function-name express-onepiece-api-api --name LIVE --function-version 2
```

### 2. Database Rollback
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier onepiece-api-db-restored \
  --db-snapshot-identifier your-snapshot-id
```

## Production Checklist

- [ ] RDS instance configured and accessible
- [ ] Secrets Manager configured
- [ ] Lambda function deployed
- [ ] API Gateway configured
- [ ] CloudWatch monitoring enabled
- [ ] Security groups configured
- [ ] SSL/TLS certificates configured
- [ ] Backup strategy implemented
- [ ] Monitoring alerts configured
- [ ] Performance testing completed
