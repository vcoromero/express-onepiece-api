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

    // Character has many DevilFruits (through ownership)
    this.hasMany(models.DevilFruit, {
      foreignKey: 'current_user_id',
      as: 'current_devil_fruits'
    });

    // Character can have many DevilFruits (many-to-many through CharacterDevilFruit)
    this.belongsToMany(models.DevilFruit, {
      through: models.CharacterDevilFruit,
      foreignKey: 'character_id',
      as: 'devil_fruits'
    });

    // Character has many CharacterDevilFruit relationships
    this.hasMany(models.CharacterDevilFruit, {
      foreignKey: 'character_id',
      as: 'character_devil_fruits'
    });

    // Character can have many HakiTypes (many-to-many through CharacterHaki)
    this.belongsToMany(models.HakiType, {
      through: models.CharacterHaki,
      foreignKey: 'character_id',
      as: 'haki_types'
    });

    // Character has many CharacterHaki relationships
    this.hasMany(models.CharacterHaki, {
      foreignKey: 'character_id',
      as: 'character_haki'
    });

    // Character can belong to many Organizations (many-to-many through CharacterOrganization)
    this.belongsToMany(models.Organization, {
      through: models.CharacterOrganization,
      foreignKey: 'character_id',
      as: 'organizations'
    });

    // Character has many CharacterOrganization relationships
    this.hasMany(models.CharacterOrganization, {
      foreignKey: 'character_id',
      as: 'character_organizations'
    });

    // Character can have many CharacterTypes (many-to-many through CharacterCharacterType)
    this.belongsToMany(models.CharacterType, {
      through: models.CharacterCharacterType,
      foreignKey: 'character_id',
      as: 'character_types'
    });

    // Character has many CharacterCharacterType relationships
    this.hasMany(models.CharacterCharacterType, {
      foreignKey: 'character_id',
      as: 'character_character_types'
    });
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
    alias: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Alias or nickname of the character'
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
    birthday: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Birthday of the character'
    },
    height: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Height of the character'
    },
    bounty: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      validate: {
        min: {
          args: [0],
          msg: 'Bounty cannot be negative'
        }
      },
      comment: 'Bounty in Berries (null if unknown or not applicable)'
    },
    origin: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Origin or birthplace of the character'
    },
    status: {
      type: DataTypes.ENUM('alive', 'deceased', 'unknown'),
      allowNull: false,
      defaultValue: 'alive',
      comment: 'Status of the character'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the character'
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL of the character image'
    },
    debut: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'First appearance (chapter/episode)'
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
        name: 'idx_alias',
        fields: ['alias']
      },
      {
        name: 'idx_bounty',
        fields: ['bounty']
      },
      {
        name: 'idx_status',
        fields: ['status']
      },
      {
        name: 'idx_race',
        fields: ['race_id']
      }
    ]
  }
);

module.exports = Character;
