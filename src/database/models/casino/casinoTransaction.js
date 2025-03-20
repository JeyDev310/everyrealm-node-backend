import { CASINO_TRANSACTION_STATUS } from '@src/utils/constants/casinoManagement.constants.js'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class CasinoTransaction extends ModelBase {
  static model = 'casinoTransaction'

  static table = 'casino_transactions'

  static options = {
    name: {
      singular: 'casino_transaction',
      plural: 'casino_transactions'
    }
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    transactionId: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      unique: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    gameId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    ledgerId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(Object.values(CASINO_TRANSACTION_STATUS)),
      allowNull: false,
      defaultValue: CASINO_TRANSACTION_STATUS.PENDING
    },
    previousTransactionId: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      unique: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    roundId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    moreDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        amount: 0,
        withdrawableAmount: 0
      }
    }
  }

  static associate (models) {
    CasinoTransaction.belongsTo(models.casinoGame, { foreignKey: 'gameId' })
    CasinoTransaction.belongsTo(models.user, { foreignKey: 'userId' })
    CasinoTransaction.belongsTo(models.ledger, { foreignKey: 'ledgerId' })

    super.associate()
  }
}
