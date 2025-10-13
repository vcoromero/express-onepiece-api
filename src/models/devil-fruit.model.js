const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * DevilFruit Model
 * 
 * Represents individual Devil Fruits in the One Piece universe
 * 
 * This model contains ONLY:
 * - Schema definition
 * - Validations
 * - Relationships (associations)
 * 
 * Business logic should be in services/devil-fruit.service.js
 */
class DevilFruit extends Model {
  /**
   * Define associations with other models
   * Called in models/index.js after all models are loaded
   * 
   * @param {Object} models - All models
   */
  static associate(models) {
    // Relationship with DevilFruitType
    this.belongsTo(models.DevilFruitType, {
      foreignKey: 'type_id',
      as: 'type'
    });
  }
}

// Initialize the model
DevilFruit.init(
  {
    // Model attributes / Schema definition
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary key'
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        name: 'name',
        msg: 'A devil fruit with this name already exists'
      },
      validate: {
        notEmpty: {
          msg: 'Name cannot be empty'
        },
        len: {
          args: [1, 100],
          msg: 'Name cannot exceed 100 characters'
        }
      },
      comment: 'Name of the devil fruit'
    },
    japanese_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Japanese name of the devil fruit'
    },
    type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'devil_fruit_types',
        key: 'id'
      },
      validate: {
        notNull: {
          msg: 'Type ID is required'
        }
      },
      comment: 'Foreign key to devil_fruit_types table'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the devil fruit'
    },
    abilities: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Special abilities of the devil fruit'
    },
    weaknesses: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Weaknesses of the devil fruit'
    },
    awakening_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the awakened form'
    },
    current_user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'characters',
        key: 'id'
      },
      comment: 'Foreign key to characters table - current user'
    },
    previous_users: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array of previous user IDs (JSON)'
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL of the devil fruit image'
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
    modelName: 'DevilFruit',
    tableName: 'devil_fruits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Individual Devil Fruits from One Piece',
    
    // Indexes
    indexes: [
      {
        name: 'idx_name',
        fields: ['name']
      },
      {
        name: 'idx_type',
        fields: ['type_id']
      },
      {
        name: 'idx_current_user',
        fields: ['current_user_id']
      }
    ]
  }
);

module.exports = DevilFruit;
