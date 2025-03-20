import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Language extends ModelBase {
  static model = 'language'

  static table = 'languages'

  static options = {
    name: {
      singular: 'language',
      plural: 'languages'
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
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      default: true
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
    Language.hasOne(models.user, { foreignKey: 'languageId', onDelete: 'SET NULL' })
    super.associate()
  }
}
