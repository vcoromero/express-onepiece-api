const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * @class Race
 * @extends Model
 * @description Represents a race in the One Piece universe (Human, Fishman, Mink, etc.)
 */
class Race extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // Race has many Characters (one-to-many relationship)
    this.hasMany(models.Character, {
      foreignKey: 'race_id',
      as: 'characters'
    });
  }
}

Race.init(
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
        msg: 'A race with this name already exists'
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
      comment: 'Name of the race (e.g., Human, Fishman, Mink)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the race and its characteristics'
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
    modelName: 'Race',
    tableName: 'races',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Catalog of races in One Piece universe',
    indexes: [
      {
        name: 'idx_name',
        fields: ['name']
      }
    ]
  }
);

module.exports = Race;
