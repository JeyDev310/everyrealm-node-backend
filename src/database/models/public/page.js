import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Page extends ModelBase {
  static model = 'page'

  static table = 'pages'

  static options = {
    name: {
      singular: 'page',
      plural: 'pages'
    }
  }

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    content: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    iconUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
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
    super.associate()
  }
}
