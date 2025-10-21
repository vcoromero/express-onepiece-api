const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'onepiece_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    
    // Connection pool configuration
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    
    // Logging configuration
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Define options for all models
    define: {
      // Use snake_case for automatically generated fields
      underscored: true,
      
      // Don't pluralize table names
      freezeTableName: true,
      
      // Add timestamps (created_at, updated_at)
      timestamps: true,
      
      // Use createdAt and updatedAt as column names
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    
    // Timezone configuration
    timezone: '+00:00'
  }
);

/**
 * Function to verify database connection
 */
const checkConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Successfully connected to MySQL database (Sequelize)');
    return true;
  } catch (error) {
    console.error('✗ Error connecting to database:', error.message);
    return false;
  }
};

/**
 * Function to sync all models (use with caution in production!)
 * @param {boolean} force - If true, drops tables before recreating
 */
const syncModels = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force && process.env.NODE_ENV === 'development' });
    console.log('✓ Database models synchronized');
    return true;
  } catch (error) {
    console.error('✗ Error synchronizing models:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  checkConnection,
  syncModels
};

