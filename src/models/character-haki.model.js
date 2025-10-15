const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * CharacterHaki Model
 * Represents the relationship between characters and their Haki abilities.
 * Business logic should be in services/character-haki.service.js
 */
class CharacterHaki extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // CharacterHaki belongs to Character
    this.belongsTo(models.Character, {
      foreignKey: 'character_id',
      as: 'character'
    });

    // CharacterHaki belongs to HakiType
    this.belongsTo(models.HakiType, {
      foreignKey: 'haki_type_id',
      as: 'haki_type'
    });
  }
}

CharacterHaki.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary key'
    },
    character_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'characters',
        key: 'id'
      },
      comment: 'Foreign key to characters table'
    },
    haki_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'haki_types',
        key: 'id'
      },
      comment: 'Foreign key to haki_types table'
    },
    mastery_level: {
      type: DataTypes.ENUM('basic', 'intermediate', 'advanced', 'master'),
      allowNull: false,
      defaultValue: 'basic',
      comment: 'Level of mastery in this Haki type'
    },
    awakened: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Whether the character has awakened this Haki type'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about the character\'s Haki abilities'
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
    modelName: 'CharacterHaki',
    tableName: 'character_haki',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Relationship between characters and their Haki abilities',
    indexes: [
      {
        name: 'idx_character',
        fields: ['character_id']
      },
      {
        name: 'idx_haki_type',
        fields: ['haki_type_id']
      },
      {
        name: 'idx_mastery',
        fields: ['mastery_level']
      }
    ]
  }
);

module.exports = CharacterHaki;
