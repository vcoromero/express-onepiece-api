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
          '01-clean-database.sql': 'Clean all data from database',
          '02-seed-races.sql': 'Seed races data only',
          '03-seed-character-types.sql': 'Seed character types data only',
          '04-seed-devil-fruit-types.sql': 'Seed devil fruit types data only',
          '05-seed-organization-types.sql': 'Seed organization types data only',
          '06-seed-haki-types.sql': 'Seed haki types data only',
          '07-seed-ships.sql': 'Seed ships data only',
          '08-seed-characters.sql': 'Seed characters data only',
          '09-seed-devil-fruits.sql': 'Seed devil fruits data only',
          '10-seed-organizations.sql': 'Seed organizations data only',
          '11-seed-character-haki.sql': 'Seed character haki relationships only',
          '12-seed-character-devil-fruits.sql': 'Seed character devil fruit relationships only',
          '13-seed-character-character-types.sql': 'Seed character character type relationships only',
          '14-seed-character-organizations.sql': 'Seed character organization relationships only',
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
    
    // Verify database connection before proceeding
    try {
      await sequelize.authenticate();
      console.log('✓ Database connection verified');
    } catch (connError) {
      console.error('❌ Database connection failed:', connError.message);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: connError.message
      });
    }
    
    const results = [];
    
    for (const fileName of fileNames) {
      try {
        console.log(`📄 Processing file: ${fileName}`);
        
        // Read SQL file from schemas directory
        const sqlFilePath = path.join(__dirname, '../../database/schemas', fileName);
        const sqlContent = await fs.readFile(sqlFilePath, 'utf8');
        
        // Clean SQL content - remove comments, USE statements, and empty lines
        const cleanSql = sqlContent
          .split('\n')
          .filter(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('--') && 
                   !trimmed.startsWith('USE ') && 
                   trimmed !== '' &&
                   !trimmed.startsWith('SELECT \'============================================\'');
          })
          .join('\n');
        
        // Split by semicolon and execute each statement
        const statements = cleanSql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('SELECT'));
        
        let statementsExecuted = 0;
        
        // Execute in a transaction for greater security
        const transaction = await sequelize.transaction();
        
        try {
          for (const statement of statements) {
            if (statement.trim()) {
              console.log(`Executing: ${statement.substring(0, 100)}...`);
              await sequelize.query(statement, { 
                raw: true, 
                transaction,
                // Escape special characters
                replacements: {}
              });
              statementsExecuted++;
            }
          }
          
          await transaction.commit();
          
          results.push({
            fileName,
            success: true,
            statementsExecuted,
            message: `File '${fileName}' executed successfully`
          });
          
          console.log(`✅ File ${fileName} completed: ${statementsExecuted} statements`);
          
        } catch (transactionError) {
          await transaction.rollback();
          throw transactionError;
        }
        
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

    // Verify connection first
    try {
      await sequelize.authenticate();
      console.log('✓ Database connection verified');
    } catch (connError) {
      console.error('❌ Database connection failed:', connError.message);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: connError.message
      });
    }

    // Get all table names
    const [tablesResult] = await sequelize.query('SHOW TABLES;');
    const tableNames = tablesResult.map(row => Object.values(row)[0]);

    const tablesInfo = [];
    for (const tableName of tableNames) {
      try {
        const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName};`);
        tablesInfo.push({
          tableName,
          rowCount: countResult[0].count,
          status: 'accessible'
        });
      } catch (tableError) {
        tablesInfo.push({
          tableName,
          rowCount: 0,
          status: 'error',
          error: tableError.message
        });
      }
    }

    // Get foreign key constraints
    let foreignKeysResult = [];
    try {
      [foreignKeysResult] = await sequelize.query(`
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
    } catch (fkError) {
      console.warn('Could not retrieve foreign key information:', fkError.message);
    }

    const hasRelationships = foreignKeysResult.length > 0;
    const totalRows = tablesInfo.reduce((sum, table) => sum + (table.rowCount || 0), 0);
    const emptyTables = tablesInfo.filter(table => table.rowCount === 0).length;

    logger.info('Database status checked successfully', {
      user: req.user?.username,
      ip: req.ip,
      totalTables: tableNames.length,
      totalRows,
      emptyTables,
      hasRelationships
    });

    res.status(200).json({
      success: true,
      message: 'Database status retrieved successfully',
      data: {
        connection: 'active',
        totalTables: tableNames.length,
        totalRows,
        emptyTables,
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

/**
 * Diagnose database issues and provide recommendations
 * @route GET /api/db/diagnose
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @returns {Promise<void>}
 */
const diagnoseDatabase = async (req, res) => {
  try {
    console.log('🔍 Diagnosing database issues...');
    
    const diagnosis = {
      connection: false,
      tables: [],
      issues: [],
      recommendations: []
    };
    
    // Test connection
    try {
      await sequelize.authenticate();
      diagnosis.connection = true;
      console.log('✓ Database connection is working');
    } catch (connError) {
      diagnosis.issues.push({
        type: 'connection',
        severity: 'critical',
        message: 'Cannot connect to database',
        error: connError.message
      });
      diagnosis.recommendations.push('Check database credentials and network connectivity');
      return res.status(200).json({
        success: false,
        message: 'Database diagnosis completed',
        data: diagnosis
      });
    }
    
    // Check if tables exist and have data
    const expectedTables = [
      'races', 'character_types', 'devil_fruit_types', 'organization_types', 
      'haki_types', 'ships', 'characters', 'devil_fruits', 'organizations',
      'character_haki', 'character_devil_fruits', 'character_character_types', 
      'character_organizations'
    ];
    
    for (const tableName of expectedTables) {
      try {
        const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName};`);
        const rowCount = countResult[0].count;
        
        diagnosis.tables.push({
          name: tableName,
          exists: true,
          rowCount,
          status: rowCount > 0 ? 'populated' : 'empty'
        });
        
        if (rowCount === 0) {
          diagnosis.issues.push({
            type: 'empty_table',
            severity: 'high',
            message: `Table '${tableName}' is empty`,
            table: tableName
          });
        }
      } catch (tableError) {
        diagnosis.tables.push({
          name: tableName,
          exists: false,
          rowCount: 0,
          status: 'missing',
          error: tableError.message
        });
        
        diagnosis.issues.push({
          type: 'missing_table',
          severity: 'critical',
          message: `Table '${tableName}' does not exist`,
          table: tableName,
          error: tableError.message
        });
      }
    }
    
    // Generate recommendations
    const emptyTables = diagnosis.tables.filter(t => t.status === 'empty');
    const missingTables = diagnosis.tables.filter(t => t.status === 'missing');
    
    if (missingTables.length > 0) {
      diagnosis.recommendations.push('Run database sync to create missing tables');
    }
    
    if (emptyTables.length > 0) {
      diagnosis.recommendations.push('Execute SQL seed files to populate empty tables');
    }
    
    if (diagnosis.issues.length === 0) {
      diagnosis.recommendations.push('Database appears to be healthy');
    }
    
    logger.info('Database diagnosis completed', {
      user: req.user?.username,
      ip: req.ip,
      issuesFound: diagnosis.issues.length,
      recommendations: diagnosis.recommendations.length
    });
    
    res.status(200).json({
      success: true,
      message: 'Database diagnosis completed',
      data: diagnosis
    });
    
  } catch (error) {
    logger.error('Error diagnosing database', {
      error: error.message,
      stack: error.stack,
      user: req.user?.username,
      ip: req.ip
    });

    res.status(500).json({
      success: false,
      message: 'Error diagnosing database',
      error: error.message
    });
  }
};

module.exports = {
  syncDatabase,
  getAvailableSqlFiles,
  executeSqlFiles,
  getDatabaseStatus,
  diagnoseDatabase
};
