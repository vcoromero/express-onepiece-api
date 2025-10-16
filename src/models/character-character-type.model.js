const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * CharacterCharacterType Model
 * Represents the relationship between characters and their character types/roles.
 * Business logic should be in services/character-character-type.service.js
 */
class CharacterCharacterType extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // CharacterCharacterType belongs to Character
    this.belongsTo(models.Character, {
      foreignKey: 'character_id',
      as: 'character'
    });

    // CharacterCharacterType belongs to CharacterType
    this.belongsTo(models.CharacterType, {
      foreignKey: 'character_type_id',
      as: 'character_type'
    });
  }
}

CharacterCharacterType.init(
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
    character_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'character_types',
        key: 'id'
      },
      comment: 'Foreign key to character_types table'
    },
    acquired_date: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Date when the character acquired this type/role'
    },
    is_current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the character currently has this type/role'
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
    modelName: 'CharacterCharacterType',
    tableName: 'character_character_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Relationship between characters and their types/roles',
    indexes: [
      {
        name: 'idx_character',
        fields: ['character_id']
      },
      {
        name: 'idx_character_type',
        fields: ['character_type_id']
      },
      {
        name: 'idx_current',
        fields: ['is_current']
      }
    ]
  }
);

module.exports = CharacterCharacterType;
