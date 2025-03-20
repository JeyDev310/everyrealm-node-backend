import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class ProviderLimit extends ModelBase {
  static model = 'providerLimit'

  static table = 'provider_limits'

  static options = {
    name: {
      singular: 'provider_limit',
      plural: 'provider_limits'
    }
  }

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    providerId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    currencyId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    minDeposit: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    maxDeposit: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    minWithdraw: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    maxWithdraw: {
      type: DataTypes.DOUBLE,
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
    // ProviderLimit.belongsTo(models.paymentProvider, { foreignKey: 'providerId' })
    // ProviderLimit.belongsTo(models.currency, { foreignKey: 'currencyId' })

    super.associate()
  }
}
