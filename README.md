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
```bash
# Create .env file in project root
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server
PORT=3000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$...  # Use /api/auth/generate-hash to create
```

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

#### Generate Password Hash (Development Only)
- **POST** `/api/auth/generate-hash`
  - Generate bcrypt hash for a password
  - **Only available in NODE_ENV=development**
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
│   │   └── auth.middleware.js
│   ├── utils/           # Utilities and helpers
│   │   └── jwt.util.js
│   ├── app.js          # Express configuration
│   └── index.js        # Entry point
├── __tests__/          # Unit tests
│   ├── auth.test.js
│   └── health.test.js
├── database/           # Database scripts
├── configs/            # Configuration files
├── Dockerfile
├── package.json
└── README.md
```

## License

MIT
