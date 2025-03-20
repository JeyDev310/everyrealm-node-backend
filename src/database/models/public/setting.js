import { SETTING_DATA_TYPES } from '@src/utils/constants/public.constants.utils'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Setting extends ModelBase {
  static model = 'setting'

  static table = 'settings'

  static options = {
    name: {
      singular: 'setting',
      plural: 'settings'
    }
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    dataType: {
      type: DataTypes.ENUM(Object.values(SETTING_DATA_TYPES)),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ''
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

  static settigDataTypes = {
    [SETTING_DATA_TYPES.NUMBER]: Number,
    [SETTING_DATA_TYPES.JSON]: Object,
    [SETTING_DATA_TYPES.STRING]: String,
    [SETTING_DATA_TYPES.BOOLEAN]: Boolean
  }

  static async getAll () {
    await Setting.findAll().map(setting => {
      setting.value = this.settigDataTypes[setting.dataType] ? this.settigDataTypes[setting.dataType](setting.value) : String(setting.value)
      return setting
    })
  }

  static associate (models) {
    super.associate()
  }
}
