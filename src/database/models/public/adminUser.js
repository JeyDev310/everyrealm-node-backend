import { DEFAULT_SITE_LAYOUT } from '@src/utils/constants/app.constants'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class AdminUser extends ModelBase {
  static model = 'adminUser'

  static table = 'admin_users'

  static options = {
    name: {
      singular: 'adminUser',
      plural: 'adminUsers'
    }
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parentAdminId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    adminRoleId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    siteLayout: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: DEFAULT_SITE_LAYOUT
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
    AdminUser.hasOne(models.permission, { foreignKey: 'adminUserId', onDelete: 'cascade' })
    AdminUser.hasMany(models.document, { foreignKey: 'actioneeId', onDelete: 'cascade' })
    AdminUser.hasMany(models.userComment, { foreignKey: 'commenterId', onDelete: 'cascade' })
    AdminUser.hasMany(models.transaction, { foreignKey: 'actioneeId', onDelete: 'cascade' })
    AdminUser.belongsTo(models.adminRole, { foreignKey: 'adminRoleId' })
    AdminUser.belongsTo(models.adminUser, { foreignKey: 'parentAdminId' })

    super.associate()
  }
}
