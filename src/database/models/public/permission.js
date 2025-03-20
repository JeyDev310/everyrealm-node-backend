import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Permission extends ModelBase {
  static model = 'permission'

  static table = 'permissions'

  static options = {
    name: {
      singular: 'permission',
      plural: 'permissions'
    }
  }

  static indexes = [{
    unique: true,
    fields: ['admin_user_id']
  }]

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    adminUserId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    permission: {
      type: DataTypes.JSONB,
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
    Permission.belongsTo(models.adminUser, { foreignKey: 'adminUserId' })
    super.associate()
  }
}
