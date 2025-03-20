import { WITHDRAWAL_STATUS, WITHDRAWAL_TYPES } from '@src/utils/constants/public.constants.utils'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Withdrawal extends ModelBase {
  static model = 'withdrawal'

  static table = 'withdrawals'

  static options = {
    name: {
      singular: 'withdrawal',
      plural: 'withdrawals'
    }
  }

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
    ledgerId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(Object.values(WITHDRAWAL_STATUS)),
      allowNull: false,
      defaultValue: WITHDRAWAL_STATUS.PENDING
    },
    type: {
      type: DataTypes.ENUM(Object.values(WITHDRAWAL_TYPES)),
      allowNull: false
    },
    amount: {
      type: DataTypes.DOUBLE,
      allowNull: false
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    comment: {
      type: DataTypes.STRING
    },
    withdrawalAddress: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    currencySymbol: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    walletId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    paymentProviderId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    actioneeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    withdrawalFee: {
      type: DataTypes.DOUBLE,
      allowNull: false
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
    Withdrawal.belongsTo(models.user, { foreignKey: 'userId' })
    Withdrawal.belongsTo(models.ledger, { foreignKey: 'ledgerId' })
    super.associate()
  }
}
