import { PAYMENT_PROVIDER_CATEGORY } from '@src/utils/constants/payment.constants'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class PaymentProvider extends ModelBase {
  static model = 'paymentProvider'

  static table = 'payment_providers'

  static options = {
    name: {
      singular: 'payment_provider',
      plural: 'payment_providers'
    }
  }

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    displayName: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    depositImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    withdrawImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    blockedCountries: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    category: {
      type: DataTypes.ENUM(Object.values(PAYMENT_PROVIDER_CATEGORY)),
      allowNull: false,
      defaultValue: PAYMENT_PROVIDER_CATEGORY.INSTANT_BANKING
    },
    depositAllowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    withdrawAllowed: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    aggregator: {
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
    PaymentProvider.hasMany(models.providerLimit, { foreignKey: 'providerId', onDelete: 'cascade' })
    PaymentProvider.hasMany(models.transaction, { foreignKey: 'paymentProviderId', onDelete: 'cascade' })
    super.associate()
  }
}
