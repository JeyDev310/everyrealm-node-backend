import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class CryptoToken extends ModelBase {
  static model = 'cryptoToken'

  static table = 'crypto_tokens'

  static options = {
    name: {
      singular: 'crypto_token',
      plural: 'crypto_tokens'
    }
  }

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    currencyId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false
    },
    contractAddress: {
      type: DataTypes.STRING,
      allowNull: true
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
    CryptoToken.belongsTo(models.currency, { foreignKey: 'currencyId' })
    CryptoToken.hasMany(models.usersDepositAddress, { foreignKey: 'tokenId', onDelete: 'cascade' })
    super.associate()
  }
}
