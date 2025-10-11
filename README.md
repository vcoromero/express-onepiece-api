# One Piece API

A RESTful API inspired by One Piece, built with Express.js and MySQL.

## Technologies

- **Express.js** - Web framework
- **MySQL** - Database
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
cp .env.example configs/.env.development
```

Edit `configs/.env.development` with your database credentials.

## Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm test` - Run unit tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run audit` - Run security audit
- `npm run audit:fix` - Fix security vulnerabilities
- `npm run lint` - Check code quality
- `npm run lint:fix` - Fix linting issues

## Environment Configuration

The project supports multiple environments:

- `configs/.env.development` - Development environment
- `configs/.env.qa` - QA environment
- `configs/.env.production` - Production environment

## Docker

Build the Docker image:
```bash
docker build -t onepiece-api .
```

Run the container:
```bash
docker run -p 3000:3000 --env-file .env onepiece-api
```

## API Endpoints

### Health Check

- **GET** `/api/health`
  - Returns the health status of the API

## Testing

Run the test suite:
```bash
npm test
```

## Postman Collection

Import the `onepiece-api.postman_collection.json` file into Postman to test the API endpoints.

## Project Structure

```
express-onepiece-api/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── app.js
│   └── index.js
├── __tests__/
├── configs/
│   ├── .env.example
│   ├── .env.test
│   ├── .env.qa
│   └── .env.production
├── Dockerfile
├── .dockerignore
├── .eslintrc.json
├── .gitignore
├── package.json
└── README.md
```

## License

MIT

