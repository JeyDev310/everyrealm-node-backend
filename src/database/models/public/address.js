import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'
import countryCodesToCountries from '../static/countryCodesToCountries.json'

export class Address extends ModelBase {
  static model = 'address'

  static table = 'addresses'

  static options = {
    name: {
      singular: 'address',
      plural: 'addresses'
    }
  }

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true
    },
    countryCode: {
      type: DataTypes.ENUM(Object.keys(countryCodesToCountries)),
      allowNull: false
    },
    country: {
      type: DataTypes.VIRTUAL,
      get: () => {
        return countryCodesToCountries[this.countryCode]
      }
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
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
    Address.belongsTo(models.user, { foreignKey: 'userId' })
    super.associate()
  }
}
