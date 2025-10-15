const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * @class Character
 * @extends Model
 * @description Represents a character in the One Piece universe
 */
class Character extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // Character belongs to Race
    this.belongsTo(models.Race, {
      foreignKey: 'race_id',
      as: 'race'
    });

    // Character belongs to CharacterType
    this.belongsTo(models.CharacterType, {
      foreignKey: 'character_type_id',
      as: 'character_type'
    });

    // Character has many DevilFruits (through ownership)
    this.hasMany(models.DevilFruit, {
      foreignKey: 'current_user_id',
      as: 'current_devil_fruits'
    });

    // Character can have many HakiTypes (many-to-many)
    // This will be implemented when CharacterHaki model is created
    // this.belongsToMany(models.HakiType, {
    //   through: models.CharacterHaki,
    //   foreignKey: 'character_id',
    //   as: 'haki_types'
    // });

    // Character can belong to many Organizations (many-to-many)
    // This will be implemented when CharacterOrganization model is created
    // this.belongsToMany(models.Organization, {
    //   through: models.CharacterOrganization,
    //   foreignKey: 'character_id',
    //   as: 'organizations'
    // });
  }
}

Character.init(
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
      unique: {
        name: 'name',
        msg: 'A character with this name already exists'
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
      comment: 'Name of the character'
    },
    japanese_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Japanese name of the character'
    },
    race_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'races',
        key: 'id'
      },
      comment: 'Foreign key to races table'
    },
    character_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'character_types',
        key: 'id'
      },
      comment: 'Foreign key to character_types table'
    },
    bounty: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Bounty cannot be negative'
        }
      },
      comment: 'Bounty in Berries (null if unknown or not applicable)'
    },
    age: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Age cannot be negative'
        },
        max: {
          args: [1000],
          msg: 'Age cannot exceed 1000 years'
        }
      },
      comment: 'Age of the character (null if unknown)'
    },
    height: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: {
          args: [0],
          msg: 'Height cannot be negative'
        },
        max: {
          args: [1000],
          msg: 'Height cannot exceed 1000 cm'
        }
      },
      comment: 'Height in centimeters (null if unknown)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the character'
    },
    abilities: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Special abilities and skills of the character'
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL of the character image'
    },
    is_alive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the character is alive or not'
    },
    first_appearance: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'First appearance (e.g., "Chapter 1", "Episode 1")'
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
    modelName: 'Character',
    tableName: 'characters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Characters from the One Piece universe',
    indexes: [
      {
        name: 'idx_name',
        fields: ['name']
      },
      {
        name: 'idx_race',
        fields: ['race_id']
      },
      {
        name: 'idx_character_type',
        fields: ['character_type_id']
      },
      {
        name: 'idx_bounty',
        fields: ['bounty']
      },
      {
        name: 'idx_is_alive',
        fields: ['is_alive']
      }
    ]
  }
);

module.exports = Character;
