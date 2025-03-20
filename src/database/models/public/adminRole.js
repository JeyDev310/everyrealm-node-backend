import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class AdminRole extends ModelBase {
  static model = 'adminRole'

  static table = 'admin_roles'

  static options = {
    name: {
      singular: 'admin_role',
      plural: 'admin_roles'
    }
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    level: {
      type: DataTypes.SMALLINT,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }

  static associate (models) {
    AdminRole.hasMany(models.adminUser, { foreignKey: 'adminRoleId', onDelete: 'cascade' })
    super.associate()
  }
}
