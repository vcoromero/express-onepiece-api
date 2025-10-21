const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const dbRoutes = require('./routes/db.routes');
const fruitTypesRoutes = require('./routes/fruit-types.routes');
const devilFruitRoutes = require('./routes/devil-fruit.routes');
const hakiTypeRoutes = require('./routes/haki-type.routes');
const raceRoutes = require('./routes/race.routes');
const characterTypeRoutes = require('./routes/character-type.routes');
const organizationTypeRoutes = require('./routes/organization-type.routes');
const characterRoutes = require('./routes/character.routes');
const organizationRoutes = require('./routes/organization.routes');
const shipRoutes = require('./routes/ship.routes');
const { generalLimiter } = require('./middlewares/rate-limiter');
const logger = require('./utils/logger');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Log all requests (optional, can be disabled in production if too verbose)
if (process.env.LOG_HTTP_REQUESTS === 'true') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.httpRequest(req, res, duration);
    });
    next();
  });
}

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/db', dbRoutes);
app.use('/api', fruitTypesRoutes);
app.use('/api', devilFruitRoutes);
app.use('/api', hakiTypeRoutes);
app.use('/api', raceRoutes);
app.use('/api', characterTypeRoutes);
app.use('/api', organizationTypeRoutes);
app.use('/api', characterRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/ships', shipRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    url: req.url,
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: `Cannot ${req.method} ${req.url}`
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  });

  res.status(err.status || 500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

module.exports = app;

