import { LEDGER_PURPOSE } from '@src/utils/constants/public.constants.utils'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Ledger extends ModelBase {
  static model = 'ledger'

  static table = 'ledgers'

  static options = {
    name: {
      singular: 'ledger',
      plural: 'ledgers'
    }
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
    },
    purpose: {
      type: DataTypes.ENUM(Object.values(LEDGER_PURPOSE)),
      allowNull: false
    },
    currencyId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    toWalletId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    fromWalletId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    exchangeRate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 1
    },
    fiatAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0.0
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
    Ledger.belongsTo(models.wallet, { foreignKey: 'toWalletId', as: 'toUserWallet' })
    Ledger.belongsTo(models.wallet, { foreignKey: 'fromWalletId', as: 'fromUserWallet' })
    Ledger.belongsTo(models.currency, { foreignKey: 'currencyId' })
    Ledger.hasOne(models.withdrawal, { foreignKey: 'ledgerId', onDelete: 'cascade' })
    Ledger.hasOne(models.transaction, { foreignKey: 'ledgerId', onDelete: 'cascade' })
    Ledger.hasOne(models.casinoTransaction, { foreignKey: 'ledgerId', onDelete: 'cascade' })
    super.associate()
  }
}
