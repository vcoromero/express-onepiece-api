const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * DevilFruitType Model
 * 
 * Represents the types of Devil Fruits (Paramecia, Zoan, Logia)
 * 
 * This model contains ONLY:
 * - Schema definition
 * - Validations
 * - Relationships (associations)
 * 
 * Business logic should be in services/fruitType.service.js
 */
class DevilFruitType extends Model {
  /**
   * Define associations with other models
   * Called in models/index.js after all models are loaded
   * 
   * @param {Object} models - All models
   */
  static associate(models) {
    // Relationship with DevilFruit
    this.hasMany(models.DevilFruit, {
      foreignKey: 'type_id',
      as: 'fruits'
    });
  }
}

// Initialize the model
DevilFruitType.init(
  {
    // Model attributes / Schema definition
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
        msg: 'A fruit type with this name already exists'
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
      comment: 'Name of the devil fruit type'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the devil fruit type'
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
    // Model options
    sequelize,
    modelName: 'DevilFruitType',
    tableName: 'devil_fruit_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Types of Devil Fruits (Paramecia, Zoan, Logia)',
    
    // Indexes
    indexes: [
      {
        name: 'idx_name',
        fields: ['name']
      }
    ]
  }
);

module.exports = DevilFruitType;
