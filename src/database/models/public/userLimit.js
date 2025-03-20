import {
  RESPONSIBLE_GAMBLING_DATA_TYPE_MAPPING,
  USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES,
  USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES
} from '@src/utils/constants/public.constants.utils'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class UserLimit extends ModelBase {
  static model = 'userLimit'

  static table = 'user_limits'

  static options = {
    name: {
      singular: 'userLimit',
      plural: 'userLimits'
    }
  }

  static indexes = [{
    unique: true,
    fields: ['user_id', 'key']
  }]

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(Object.values(USER_RESPONSIBLE_GAMBLING_LIMIT_DATA_TYPES)),
      allowNull: false
    },
    key: {
      type: DataTypes.ENUM(Object.values(USER_RESPONSIBLE_GAMBLING_LIMIT_TYPES)),
      allowNull: false
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    currentValue: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
    },
    expireAt: {
      allowNull: true,
      type: DataTypes.DATE
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

  /**
   * @param {*} userId
   * @param {import('sequelize').BulkCreateOptions} options
   * @returns
   */
  static async createAll (userId, options) {
    const userLimits = await this.bulkCreate(Object.keys(RESPONSIBLE_GAMBLING_DATA_TYPE_MAPPING).map(key => {
      return {
        key,
        userId,
        type: RESPONSIBLE_GAMBLING_DATA_TYPE_MAPPING[key]
      }
    }), options)

    return userLimits
  }

  static associate (models) {
    UserLimit.belongsTo(models.user, { foreignKey: 'userId' })
    super.associate()
  }
}
