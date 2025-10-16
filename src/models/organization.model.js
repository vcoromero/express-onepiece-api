const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * Organization Model
 * Represents organizations in the One Piece universe (pirate crews, marines, etc.).
 * Business logic should be in services/organization.service.js
 */
class Organization extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // Organization belongs to OrganizationType
    this.belongsTo(models.OrganizationType, {
      foreignKey: 'organization_type_id',
      as: 'organization_type'
    });

    // Organization belongs to Character (leader)
    this.belongsTo(models.Character, {
      foreignKey: 'leader_id',
      as: 'leader'
    });

    // Organization belongs to Ship
    this.belongsTo(models.Ship, {
      foreignKey: 'ship_id',
      as: 'ship'
    });

    // Organization has many CharacterOrganizations
    this.hasMany(models.CharacterOrganization, {
      foreignKey: 'organization_id',
      as: 'character_organizations'
    });
  }
}

Organization.init(
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
      comment: 'Name of the organization'
    },
    organization_type_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'organization_types',
        key: 'id'
      },
      comment: 'Foreign key to organization_types table'
    },
    leader_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'characters',
        key: 'id'
      },
      comment: 'Foreign key to characters table (leader)'
    },
    ship_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: 'ships',
        key: 'id'
      },
      comment: 'Foreign key to ships table'
    },
    flag_description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the organization flag'
    },
    jolly_roger_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'URL of the jolly roger image'
    },
    base_location: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Base location of the organization'
    },
    total_bounty: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      defaultValue: 0,
      comment: 'Total bounty of all members'
    },
    status: {
      type: DataTypes.ENUM('active', 'disbanded', 'destroyed'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Status of the organization'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the organization'
    },
    founded_date: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Date when the organization was founded'
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
    modelName: 'Organization',
    tableName: 'organizations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Organizations including pirate crews, marines, revolutionary army',
    indexes: [
      {
        name: 'idx_name',
        fields: ['name']
      },
      {
        name: 'idx_type',
        fields: ['organization_type_id']
      },
      {
        name: 'idx_leader',
        fields: ['leader_id']
      },
      {
        name: 'idx_status',
        fields: ['status']
      }
    ]
  }
);

module.exports = Organization;
