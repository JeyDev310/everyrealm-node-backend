import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Wallet extends ModelBase {
  static model = 'wallet'

  static table = 'wallets'

  static options = {
    name: {
      singular: 'wallet',
      plural: 'wallets'
    }
  }

  static indexes = [{
    unique: true,
    fields: ['user_id', 'currency_id']
  }]

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    currencyId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    walletWithdrawalLimit: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0
    },
    walletDailyWithdrawalLimit: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0
    },
    withdrawableAmount: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0
    }
  }

  static associate (models) {
    Wallet.belongsTo(models.user, { foreignKey: 'userId' })
    Wallet.belongsTo(models.currency, { foreignKey: 'currencyId', targetId: 'id' })
    Wallet.hasMany(models.ledger, { foreignKey: 'toWalletId', onDelete: 'cascade' })
    Wallet.hasMany(models.ledger, { foreignKey: 'fromWalletId', onDelete: 'cascade' })
    // Wallet.hasMany(models.betslip, { foreignKey: 'walletId', onDelete: 'cascade' })
    // Wallet.hasMany(models.exchangeBet, { foreignKey: 'walletId', onDelete: 'cascade' })
    super.associate()
  }
}
