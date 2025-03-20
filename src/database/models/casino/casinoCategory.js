import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class CasinoCategory extends ModelBase {
  static model = 'casinoCategory'

  static table = 'casino_categories'

  static options = {
    name: {
      singular: 'casino_category',
      plural: 'casino_categories'
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
      type: DataTypes.JSONB,
      allowNull: false
    },
    uniqueId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    iconUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }

  static associate (models) {
    CasinoCategory.hasMany(models.casinoGameCategory, { foreignKey: 'casinoCategoryId' })
    super.associate()
  }
}
