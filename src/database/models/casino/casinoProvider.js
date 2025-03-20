import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class CasinoProvider extends ModelBase {
  static model = 'casinoProvider'

  static table = 'casino_providers'

  static options = {
    name: {
      singular: 'casino_provider',
      plural: 'casino_providers'
    }
  }

  static indexes = [{
    unique: true,
    fields: ['unique_id', 'casino_aggregator_id']
  }]

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    uniqueId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    casinoAggregatorId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    restrictedCountries: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    iconUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }

  static associate (models) {
    CasinoProvider.hasMany(models.casinoGame, { foreignKey: 'casinoProviderId' })
    CasinoProvider.belongsTo(models.casinoAggregator, { foreignKey: 'casinoAggregatorId', onDelete: 'cascade' })
    super.associate()
  }
}
