const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * Organization Model
 * Represents organizations including pirate crews, marines, revolutionary army
 * @description Organizations are dynamic entities that can be created, modified, and deleted
 * @author Database Expert
 * @version 1.0.0
 */
const Organization = sequelize.define('Organization', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    comment: 'Unique organization identifier'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Organization name cannot be empty'
      },
      len: {
        args: [1, 100],
        msg: 'Organization name must be between 1 and 100 characters'
      }
    },
    comment: 'Organization name'
  },
  organizationTypeId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    field: 'organization_type_id',
    references: {
      model: 'organization_types',
      key: 'id'
    },
    comment: 'Foreign key to organization_types table'
  },
  leaderId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    field: 'leader_id',
    references: {
      model: 'characters',
      key: 'id'
    },
    comment: 'Foreign key to characters table (organization leader)'
  },
  shipId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: true,
    field: 'ship_id',
    references: {
      model: 'ships',
      key: 'id'
    },
    comment: 'Foreign key to ships table (organization flagship)'
  },
  baseLocation: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'base_location',
    validate: {
      len: {
        args: [0, 100],
        msg: 'Base location must be 100 characters or less'
      }
    },
    comment: 'Organization base location'
  },
  totalBounty: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    defaultValue: 0,
    field: 'total_bounty',
    validate: {
      min: {
        args: [0],
        msg: 'Total bounty cannot be negative'
      }
    },
    comment: 'Total bounty of all organization members in Berries'
  },
  status: {
    type: DataTypes.ENUM('active', 'disbanded', 'destroyed'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: {
        args: [['active', 'disbanded', 'destroyed']],
        msg: 'Status must be active, disbanded, or destroyed'
      }
    },
    comment: 'Organization current status'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Organization description'
  }
}, {
  tableName: 'organizations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
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
    },
    {
      name: 'idx_organization_bounty_status',
      fields: ['total_bounty', 'status']
    }
  ],
  comment: 'Organizations including pirate crews, marines, revolutionary army'
});

/**
 * Define model associations
 * @description Establishes relationships with other models
 */
Organization.associate = (models) => {
  // Belongs to OrganizationType
  Organization.belongsTo(models.OrganizationType, {
    foreignKey: 'organizationTypeId',
    as: 'organizationType',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  // Belongs to Character (leader)
  Organization.belongsTo(models.Character, {
    foreignKey: 'leaderId',
    as: 'leader',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Belongs to Ship
  Organization.belongsTo(models.Ship, {
    foreignKey: 'shipId',
    as: 'ship',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // Has many CharacterOrganizations (members)
  Organization.hasMany(models.CharacterOrganization, {
    foreignKey: 'organization_id',
    as: 'members',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Many-to-many relationship with Characters through CharacterOrganizations
  Organization.belongsToMany(models.Character, {
    through: models.CharacterOrganization,
    foreignKey: 'organization_id',
    otherKey: 'character_id',
    as: 'characters',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

module.exports = Organization;
