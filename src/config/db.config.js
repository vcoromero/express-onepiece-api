const mysql = require('mysql2/promise');
require('dotenv').config({ path: `./configs/.env.${process.env.NODE_ENV || 'development'}` });

// Connection pool for better performance
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'onepiece_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Function to verify database connection
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Successfully connected to MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ Error connecting to database:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  checkConnection
};
