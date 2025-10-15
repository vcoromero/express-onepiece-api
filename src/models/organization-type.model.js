const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/sequelize.config');

/**
 * @class OrganizationType
 * @extends Model
 * @description Represents an organization type in the One Piece universe (Pirate Crew, Marine, Revolutionary Army, etc.)
 */
class OrganizationType extends Model {
  /**
   * Defines associations with other models.
   * @param {object} models - The models object containing all defined models.
   */
  static associate(models) {
    // OrganizationType has many OrganizationOrganizationTypes (many-to-many relationship with Organization)
    // This association will be defined when the OrganizationOrganizationType model is created
    // this.belongsToMany(models.Organization, {
    //   through: models.OrganizationOrganizationType,
    //   foreignKey: 'organization_type_id',
    //   as: 'organizations'
    // });
  }
}

OrganizationType.init(
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
        msg: 'An organization type with this name already exists'
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
      comment: 'Name of the organization type (e.g., Pirate Crew, Marine, Revolutionary Army)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of the organization type and its characteristics'
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
    modelName: 'OrganizationType',
    tableName: 'organization_types',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    comment: 'Types of organizations (Pirate Crew, Marine, Revolutionary Army, etc.)',
    indexes: [
      {
        name: 'idx_name',
        fields: ['name']
      }
    ]
  }
);

module.exports = OrganizationType;
