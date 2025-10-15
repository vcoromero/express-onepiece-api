const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * CharacterDevilFruit Model
 * Represents the relationship between characters and their Devil Fruit abilities.
 * Business logic should be in services/character-devil-fruit.service.js
 */
class CharacterDevilFruit extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // CharacterDevilFruit belongs to Character
    this.belongsTo(models.Character, {
      foreignKey: 'character_id',
      as: 'character'
    });

    // CharacterDevilFruit belongs to DevilFruit
    this.belongsTo(models.DevilFruit, {
      foreignKey: 'devil_fruit_id',
      as: 'devil_fruit'
    });
  }
}

CharacterDevilFruit.init(
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
    devil_fruit_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'devil_fruits',
        key: 'id'
      },
      comment: 'Foreign key to devil_fruits table'
    },
    acquired_date: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Date when the character acquired the devil fruit'
    },
    is_current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the character currently has this devil fruit'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about the character\'s devil fruit usage'
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
    modelName: 'CharacterDevilFruit',
    tableName: 'character_devil_fruits',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Relationship between characters and their Devil Fruit abilities',
    indexes: [
      {
        name: 'idx_character',
        fields: ['character_id']
      },
      {
        name: 'idx_fruit',
        fields: ['devil_fruit_id']
      },
      {
        name: 'idx_current',
        fields: ['is_current']
      }
    ]
  }
);

module.exports = CharacterDevilFruit;
