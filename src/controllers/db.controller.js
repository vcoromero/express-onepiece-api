const { sequelize, syncModels } = require('../config/sequelize.config');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

/**
 * Sync database with Sequelize models
 * @route POST /api/db/sync
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
const syncDatabase = async (req, res) => {
  try {
    console.log('🔄 Syncing database with Sequelize models...');
    const result = await syncModels(false); // false = don't force (don't drop tables)

    if (result) {
      logger.info('Database sync successful', {
        user: req.user?.username,
        ip: req.ip
      });
      res.status(200).json({
        success: true,
        message: 'Database synchronized successfully with Sequelize models',
        data: {
          synced: true,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      logger.error('Database sync failed', {
        user: req.user?.username,
        ip: req.ip
      });
      res.status(500).json({
        success: false,
        message: 'Database sync failed',
        data: {
          synced: false,
          timestamp: new Date().toISOString()
        }
      });
    }
  } catch (error) {
    logger.error('Error syncing database', {
      error: error.message,
      stack: error.stack,
      user: req.user?.username,
      ip: req.ip
    });
    res.status(500).json({
      success: false,
      message: 'Error syncing database',
      error: error.message
    });
  }
};

/**
 * Get available SQL files in schemas directory
 * @route GET /api/db/available-sql-files
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
const getAvailableSqlFiles = async (req, res) => {
  try {
    const schemasDir = path.join(__dirname, '../../database/schemas');
    const files = await fs.readdir(schemasDir);
    
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .map(file => {
        // Extract description from file name
        const descriptions = {
          '01-seed-catalog-data.sql': 'Seed catalog data (races, types, ships, etc.)',
          '02-seed-main-data.sql': 'Seed main data (characters, organizations, devil fruits)',
          '03-seed-relationships.sql': 'Seed relationship data (character-organization, etc.)',
          '04-create-views.sql': 'Create useful database views'
        };
        
        return {
          fileName: file,
          description: descriptions[file] || `SQL file: ${file}`,
          size: 'Unknown' // Could add file size if needed
        };
      });

    res.status(200).json({
      success: true,
      message: 'Available SQL files retrieved successfully',
      data: {
        files: sqlFiles,
        total: sqlFiles.length
      }
    });
    
  } catch (error) {
    logger.error('Error getting available SQL files', {
      error: error.message,
      stack: error.stack,
      user: req.user?.username,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Error getting available SQL files',
      error: error.message
    });
  }
};

/**
 * Execute SQL files (single or multiple)
 * @route POST /api/db/execute-sql
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
const executeSqlFiles = async (req, res) => {
  try {
    const { fileNames } = req.body;
    
    if (!fileNames || !Array.isArray(fileNames) || fileNames.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File names array is required',
        error: 'Missing or invalid fileNames parameter'
      });
    }
    
    console.log(`📄 Executing SQL files: ${fileNames.join(', ')}`);
    
    const results = [];
    
    for (const fileName of fileNames) {
      try {
        console.log(`📄 Processing file: ${fileName}`);
        
        // Read SQL file from schemas directory
        const sqlFilePath = path.join(__dirname, '../../database/schemas', fileName);
        const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
        
        // Clean SQL content - remove comments and split by semicolon
        const cleanSql = sqlContent
          .split('\n')
          .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
          .join('\n');
        
        // Split by semicolon and execute each statement
        const statements = cleanSql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0);
        
        let statementsExecuted = 0;
        for (const statement of statements) {
          if (statement.trim()) {
            await sequelize.query(statement, { raw: true });
            statementsExecuted++;
          }
        }
        
        results.push({
          fileName,
          success: true,
          statementsExecuted,
          message: `File '${fileName}' executed successfully`
        });
        
        console.log(`✅ File ${fileName} completed: ${statementsExecuted} statements`);
        
      } catch (fileError) {
        console.error(`❌ Error in file ${fileName}:`, fileError.message);
        results.push({
          fileName,
          success: false,
          error: fileError.message,
          message: `File '${fileName}' failed: ${fileError.message}`
        });
      }
    }
    
    const successfulFiles = results.filter(r => r.success).length;
    const failedFiles = results.filter(r => !r.success).length;
    
    logger.info('SQL files executed', {
      user: req.user.username,
      ip: req.ip,
      totalFiles: fileNames.length,
      successfulFiles,
      failedFiles
    });

    res.status(200).json({
      success: failedFiles === 0,
      message: `Executed ${fileNames.length} SQL files: ${successfulFiles} successful, ${failedFiles} failed`,
      data: {
        totalFiles: fileNames.length,
        successfulFiles,
        failedFiles,
        results,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    logger.error('Error executing SQL files', {
      error: error.message,
      stack: error.stack,
      user: req.user?.username,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Error executing SQL files',
      error: error.message
    });
  }
};

/**
 * Get database status and structure
 * @route GET /api/db/status
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
const getDatabaseStatus = async (req, res) => {
  try {
    console.log('🔍 Checking database structure and relationships...');

    // Get all table names
    const [tablesResult] = await sequelize.query('SHOW TABLES;');
    const tableNames = tablesResult.map(row => Object.values(row)[0]);

    const tablesInfo = [];
    for (const tableName of tableNames) {
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName};`);
      tablesInfo.push({
        tableName,
        rowCount: countResult[0].count
      });
    }

    // Get foreign key constraints
    const [foreignKeysResult] = await sequelize.query(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_SCHEMA = DATABASE() AND
        REFERENCED_TABLE_NAME IS NOT NULL;
    `);

    const hasRelationships = foreignKeysResult.length > 0;

    logger.info('Database status checked successfully', {
      user: req.user?.username,
      ip: req.ip,
      totalTables: tableNames.length,
      hasRelationships
    });

    res.status(200).json({
      success: true,
      message: 'Database status retrieved successfully',
      data: {
        totalTables: tableNames.length,
        tables: tablesInfo,
        foreignKeys: foreignKeysResult,
        hasRelationships,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Error checking database status', {
      error: error.message,
      stack: error.stack,
      user: req.user?.username,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Error checking database status',
      error: error.message
    });
  }
};

module.exports = {
  syncDatabase,
  getAvailableSqlFiles,
  executeSqlFiles,
  getDatabaseStatus
};
