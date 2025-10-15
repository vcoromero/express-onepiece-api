const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * @class CharacterType
 * @extends Model
 * @description Represents a character type in the One Piece universe (Pirate, Marine, Revolutionary, etc.)
 */
class CharacterType extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // CharacterType has many CharacterCharacterTypes (many-to-many relationship with Character)
    // This association will be defined when the CharacterCharacterType model is created
    // this.belongsToMany(models.Character, {
    //   through: models.CharacterCharacterType,
    //   foreignKey: 'character_type_id',
    //   as: 'characters'
    // });
  }
}

CharacterType.init(
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
        msg: 'A character type with this name already exists'
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
      comment: 'Name of the character type (e.g., Pirate, Marine, Revolutionary)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the character type and its characteristics'
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
    modelName: 'CharacterType',
    tableName: 'character_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Types/roles of characters (Pirate, Marine, Captain, etc.)',
    indexes: [
      {
        name: 'idx_name',
        fields: ['name']
      }
    ]
  }
);

module.exports = CharacterType;
