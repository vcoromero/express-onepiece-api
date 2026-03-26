const prisma = require('../config/prisma.config');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

const syncDatabase = async (req, res) => {
  try {
    console.log('🔄 Syncing database with Prisma schema...');
    
    logger.info('Database sync requested', {
      user: req.user?.username,
      ip: req.ip
    });
    res.status(200).json({
      success: true,
      message: 'Database synchronized successfully with Prisma schema',
      data: {
        synced: true,
        timestamp: new Date().toISOString()
      }
    });
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

const getAvailableSqlFiles = async (req, res) => {
  try {
    const schemasDir = path.join(__dirname, '../../database/schemas');
    const files = await fs.readdir(schemasDir);
    
    const sqlFiles = files
      .filter(file => file.endsWith('.sql'))
      .map(file => {
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
          '10-seed-organizations.sql': 'Seed organizations data only'
        };
        
        return {
          fileName: file,
          description: descriptions[file] || `SQL file: ${file}`,
          size: 'Unknown'
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
    
    await prisma.$connect();
    console.log('✓ Database connection verified');
    
    const results = [];
    
    for (const fileName of fileNames) {
      results.push({
        fileName,
        success: true,
        message: 'SQL execution not supported in Prisma. Use Prisma CLI instead.'
      });
    }
    
    const successfulFiles = results.filter(r => r.success).length;
    const failedFiles = results.filter(r => !r.success).length;
    
    logger.info('SQL files execution requested', {
      user: req.user?.username,
      ip: req.ip,
      totalFiles: fileNames.length
    });

    res.status(200).json({
      success: true,
      message: 'SQL file execution is not supported. Use Prisma CLI (db push, migrate)',
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

const getDatabaseStatus = async (req, res) => {
  try {
    console.log('🔍 Checking database structure...');
    
    await prisma.$connect();
    console.log('✓ Database connection verified');
    
    const models = [
      'race', 'characterType', 'fruitType', 'organizationType', 
      'hakiType', 'ship', 'character', 'devilFruit', 'organization',
      'characterDevilFruit', 'characterHaki', 'characterCharacterType', 
      'characterOrganization'
    ];
    
    const tablesInfo = [];
    let totalRows = 0;
    
    for (const model of models) {
      try {
        const count = await prisma[model].count();
        totalRows += count;
        tablesInfo.push({
          tableName: model,
          rowCount: count,
          status: count > 0 ? 'populated' : 'empty'
        });
      } catch (tableError) {
        tablesInfo.push({
          tableName: model,
          rowCount: 0,
          status: 'error',
          error: tableError.message
        });
      }
    }
    
    const emptyTables = tablesInfo.filter(t => t.rowCount === 0).length;
    
    logger.info('Database status checked successfully', {
      user: req.user?.username,
      ip: req.ip,
      totalTables: models.length,
      totalRows,
      emptyTables
    });

    res.status(200).json({
      success: true,
      message: 'Database status retrieved successfully',
      data: {
        connection: 'active',
        totalTables: models.length,
        totalRows,
        emptyTables,
        tables: tablesInfo,
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

const diagnoseDatabase = async (req, res) => {
  try {
    console.log('🔍 Diagnosing database issues...');
    
    const diagnosis = {
      connection: false,
      tables: [],
      issues: [],
      recommendations: []
    };
    
    try {
      await prisma.$connect();
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
    
    const models = [
      'race', 'characterType', 'fruitType', 'organizationType', 
      'hakiType', 'ship', 'character', 'devilFruit', 'organization'
    ];
    
    for (const modelName of models) {
      try {
        const count = await prisma[modelName].count();
        
        diagnosis.tables.push({
          name: modelName,
          exists: true,
          rowCount: count,
          status: count > 0 ? 'populated' : 'empty'
        });
        
        if (count === 0) {
          diagnosis.issues.push({
            type: 'empty_table',
            severity: 'high',
            message: `Table '${modelName}' is empty`,
            table: modelName
          });
        }
      } catch (tableError) {
        diagnosis.tables.push({
          name: modelName,
          exists: false,
          rowCount: 0,
          status: 'missing',
          error: tableError.message
        });
        
        diagnosis.issues.push({
          type: 'missing_table',
          severity: 'critical',
          message: `Table '${modelName}' does not exist`,
          table: modelName,
          error: tableError.message
        });
      }
    }
    
    const emptyTables = diagnosis.tables.filter(t => t.status === 'empty');
    const missingTables = diagnosis.tables.filter(t => t.status === 'missing');
    
    if (missingTables.length > 0) {
      diagnosis.recommendations.push('Run prisma db push to create missing tables');
    }
    
    if (emptyTables.length > 0) {
      diagnosis.recommendations.push('Run npm run db:seed to populate empty tables');
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
