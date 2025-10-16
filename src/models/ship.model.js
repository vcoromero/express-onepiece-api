const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * Ship Model
 * Represents ships used by crews and organizations in One Piece universe
 * 
 * @typedef {Object} Ship
 * @property {number} id - Unique identifier
 * @property {string} name - Ship name
 * @property {string} description - Ship description
 * @property {string} status - Ship status (active, destroyed, retired)
 * @property {string} image_url - Ship image URL
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */
const Ship = sequelize.define('Ship', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Ship name is required'
      },
      len: {
        args: [1, 100],
        msg: 'Ship name must be between 1 and 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Description must not exceed 1000 characters'
      }
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'destroyed', 'retired'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'destroyed', 'retired']],
        msg: 'Status must be active, destroyed, or retired'
      }
    }
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Image URL must be a valid URL'
      },
      len: {
        args: [0, 255],
        msg: 'Image URL must not exceed 255 characters'
      }
    }
  }
}, {
  tableName: 'ships',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_ship_name',
      fields: ['name']
    },
    {
      name: 'idx_ship_status',
      fields: ['status']
    }
  ],
  comment: 'Ships used by crews and organizations'
});

/**
 * Define model associations
 * Ships can be used by multiple organizations
 */
Ship.associate = function(models) {
  // Ship belongs to many organizations (through foreign key in organizations table)
  Ship.hasMany(models.Organization, {
    foreignKey: 'ship_id',
    as: 'organizations',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });
};

module.exports = Ship;
