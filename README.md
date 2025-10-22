# 🏴‍☠️ One Piece API

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com)
[![Coverage](https://img.shields.io/badge/coverage-87.37%25-brightgreen)](https://github.com)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![AWS](https://img.shields.io/badge/AWS-deployed-orange)](https://aws.amazon.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

A comprehensive RESTful API inspired by the One Piece universe, built with Express.js and deployed on AWS Lambda. This API provides access to characters, organizations, ships, devil fruits, and their complex relationships from the One Piece world.

## 🌟 Features

- **🏴‍☠️ Complete One Piece Universe**: Characters, Organizations, Ships, Devil Fruits, Haki
- **☁️ AWS Lambda Deployment**: Serverless architecture with automatic scaling
- **🔐 JWT Authentication**: Secure token-based authentication
- **📊 Advanced Relationships**: Complex many-to-many relationships between entities
- **🔍 Full-Text Search**: Search across all entities with pagination
- **⚡ Rate Limiting**: Built-in protection against abuse
- **🧪 Comprehensive Testing**: 778 tests with 87.37% coverage
- **📚 Complete Documentation**: Detailed API documentation and guides

## 🚀 Live Demo

**Production API**: [https://d1lu4jq11jb97o.cloudfront.net/](https://d1lu4jq11jb97o.cloudfront.net/)

```bash
# Quick health check
curl https://d1lu4jq11jb97o.cloudfront.net/api/health
```

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL (RDS on AWS)
- **ORM**: Sequelize
- **Authentication**: JWT with bcrypt
- **Deployment**: AWS Lambda + API Gateway
- **Testing**: Jest with Supertest
- **Logging**: Winston
- **Security**: Helmet, CORS, Rate Limiting

## 🏗️ Architecture

This project follows a **Service Layer Pattern** for clean, maintainable code:

```
Client → Controller → Service → Model → Database
```

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and data processing
- **Models**: Sequelize ORM models for database interaction
- **Middleware**: Authentication, rate limiting, logging

## 📋 API Endpoints

### Core Entities
- **Characters**: Complete character profiles with relationships
- **Organizations**: Crews, Marines, and other groups
- **Ships**: Vessels with organization associations
- **Devil Fruits**: Fruits with types and abilities
- **Haki Types**: Observation, Armament, and Conqueror's Haki

### Key Features
- **Advanced Search**: Full-text search with filters
- **Pagination**: Efficient data loading
- **Relationships**: Complex entity associations
- **Authentication**: JWT-based security
- **Rate Limiting**: API protection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/vcoromero/express-onepiece-api.git
cd express-onepiece-api

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials
```

### Database Setup

```bash
# Create MySQL database
mysql -u root -p -e "CREATE DATABASE onepiece_db;"

# Execute schema files
for file in database/schemas/*.sql; do
  echo "Executing $file..."
  mysql -u root -p onepiece_db < "$file"
done
```

### Running the Application

```bash
# Development mode
npm run dev

# Production mode
npm start

# Run tests
npm test
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=onepiece_db
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

## 📚 Documentation

- **[API Documentation](docs/api.md)** - Complete API reference
- **[Database Schema](docs/database.md)** - Database structure and relationships
- **[Deployment Guide](docs/deployment.md)** - AWS Lambda deployment
- **[Development Guide](docs/development.md)** - Local development setup

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

**Current Status**: 778 tests passing with 87.37% coverage

## 🚀 Deployment

This API is designed for AWS Lambda deployment:

1. **AWS Lambda**: Serverless compute
2. **API Gateway**: HTTP API management
3. **RDS MySQL**: Managed database
4. **CloudWatch**: Monitoring and logging
5. **Secrets Manager**: Secure configuration

See [Deployment Guide](docs/deployment.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Victor Jesus Romero Perez**
- Email: vcoromero@gmail.com
- Phone: +529931348794
- GitHub: [@vcoromero](https://github.com/vcoromero)

## 🙏 Acknowledgments

- One Piece universe created by Eiichiro Oda
- Express.js community
- AWS for cloud infrastructure
- All contributors and testers

---

<p align="center">
  <strong>🏴‍☠️ "A man's dreams never die" 🏴‍☠️</strong><br>
  <em>— Marshall D. Teach (Blackbeard)</em>
</p>
