import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class CasinoAggregator extends ModelBase {
  static model = 'casinoAggregator'

  static table = 'casino_aggregators'

  static options = {
    name: {
      singular: 'casino_aggregator',
      plural: 'casino_aggregators'
    }
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    uniqueId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: false,
      unique: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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

  static associate (model) {
    CasinoAggregator.hasMany(model.casinoProvider, { foreignKey: 'casinoAggregatorId' })
    super.associate()
  }
}
