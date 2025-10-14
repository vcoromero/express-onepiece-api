const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * HakiType Model
 * Represents the different types of Haki in the One Piece universe
 * 
 * @class HakiType
 * @extends {Model}
 */
class HakiType extends Model {
  /**
   * Define associations with other models
   * @param {Object} models - Object containing all models
   */
  static associate(models) {
    // HakiType has many CharacterHaki relationships
    this.hasMany(models.CharacterHaki, {
      foreignKey: 'haki_type_id',
      as: 'characterHaki'
    });
  }
}

HakiType.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary key'
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'name',
        msg: 'A Haki type with this name already exists'
      },
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [1, 50],
          msg: 'Name cannot exceed 50 characters'
        }
      },
      comment: 'Name of the Haki type'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the Haki type and its abilities'
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: {
          args: [0, 50],
          msg: 'Color cannot exceed 50 characters'
        }
      },
      comment: 'Color associated with this Haki type'
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
    modelName: 'HakiType',
    tableName: 'haki_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Types of Haki (Observation, Armament, Conqueror)',
    indexes: [
      {
        name: 'idx_name',
        fields: ['name']
      }
    ]
  }
);

module.exports = HakiType;
