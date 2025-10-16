const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * CharacterOrganization Model
 * Represents the relationship between characters and organizations (membership).
 * Business logic should be in services/character-organization.service.js
 */
class CharacterOrganization extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // CharacterOrganization belongs to Character
    this.belongsTo(models.Character, {
      foreignKey: 'character_id',
      as: 'character'
    });

    // CharacterOrganization belongs to Organization
    this.belongsTo(models.Organization, {
      foreignKey: 'organization_id',
      as: 'organization'
    });
  }
}

CharacterOrganization.init(
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
    organization_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id'
      },
      comment: 'Foreign key to organizations table'
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Role in organization (Captain, First Mate, etc.)'
    },
    joined_date: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Date when the character joined the organization'
    },
    left_date: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Date when the character left the organization'
    },
    is_current: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether the character is currently in this organization'
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
    modelName: 'CharacterOrganization',
    tableName: 'character_organizations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Membership relationship between characters and organizations',
    indexes: [
      {
        name: 'idx_character',
        fields: ['character_id']
      },
      {
        name: 'idx_organization',
        fields: ['organization_id']
      },
      {
        name: 'idx_current',
        fields: ['is_current']
      }
    ]
  }
);

module.exports = CharacterOrganization;
