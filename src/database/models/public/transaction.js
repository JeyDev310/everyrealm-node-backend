import { TRANSACTION_STATUS } from '@src/utils/constants/public.constants.utils'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Transaction extends ModelBase {
  static model = 'transaction'

  static table = 'transactions'

  static options = {
    name: {
      singular: 'transaction',
      plural: 'transactions'
    }
  }

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    ledgerId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(Object.values(TRANSACTION_STATUS)),
      allowNull: false,
      defaultValue: TRANSACTION_STATUS.PENDING
    },
    paymentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'order Id'
    },
    withdrawSpentId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'withdraw spend request Id'
    },
    fees: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'withdraw fees'
    },
    paymentProviderId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actioneeId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    moreDetails: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    isWagerRequired:{
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    wagerStatus:{
      type: DataTypes.INTEGER,
      allowNull: true
    },
    amountToWager: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    },
    wageredAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: 0
    }
  }

  static associate (models) {
    Transaction.belongsTo(models.user, { foreignKey: 'userId' })
    Transaction.belongsTo(models.ledger, { foreignKey: 'ledgerId' })
    Transaction.belongsTo(models.adminUser, { foreignKey: 'actioneeId' })
    // Transaction.belongsTo(models.paymentProvider, { foreignKey: 'paymentProviderId' })
    super.associate()
  }
}
