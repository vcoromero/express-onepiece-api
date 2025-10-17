const mysql = require('mysql2/promise');
const { getSecrets } = require('./secrets');

let pool = null;

const createPool = async () => {
  if (pool) return pool;
  
  let dbConfig;
  
  try {
    const secrets = await getSecrets();
    dbConfig = {
      host: secrets.DB_HOST,
      user: secrets.DB_USER,
      password: secrets.DB_PASSWORD,
      database: secrets.DB_NAME,
      port: secrets.DB_PORT
    };
    console.log('✓ Using AWS Secrets Manager for database connection');
  } catch (error) {
    console.log('⚠️ Secrets Manager not available, using local environment variables');
    dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'onepiece_db',
      port: process.env.DB_PORT || 3306
    };
  }
  
  pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  });
  
  return pool;
};

const checkConnection = async () => {
  try {
    const dbPool = await createPool();
    const connection = await dbPool.getConnection();
    console.log('✓ Successfully connected to MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Error connecting to database:', error.message);
    return false;
  }
};

module.exports = {
  createPool,
  checkConnection
};
