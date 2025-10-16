const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * Ship Model
 * Represents ships used by crews and organizations.
 * Business logic should be in services/ship.service.js
 */
class Ship extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // Ship has many Organizations
    this.hasMany(models.Organization, {
      foreignKey: 'ship_id',
      as: 'organizations'
    });
  }
}

Ship.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary key'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Name of the ship'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the ship'
    },
    status: {
      type: DataTypes.ENUM('active', 'destroyed', 'retired'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Status of the ship'
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL of the ship image'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Record creation timestamp'
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Record last update timestamp'
    }
  },
  {
    sequelize,
    modelName: 'Ship',
    tableName: 'ships',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Ships used by crews and organizations',
    indexes: [
      {
        name: 'idx_name',
        fields: ['name']
      },
      {
        name: 'idx_status',
        fields: ['status']
      }
    ]
  }
);

module.exports = Ship;
