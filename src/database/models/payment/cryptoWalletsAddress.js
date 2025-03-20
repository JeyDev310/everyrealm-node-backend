import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class CryptoWalletAddress extends ModelBase {
  static model = 'cryptoWalletAddress'

  static table = 'crypto_wallet_addresses'

  static options = {
    name: {
      singular: 'crypto_wallet_address',
      plural: 'crypto_wallet_addresses'
    }
  }

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false
    },
    walletId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currencyId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    addressId: {
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
    super.associate()
  }
}
