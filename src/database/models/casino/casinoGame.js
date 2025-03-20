import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class CasinoGame extends ModelBase {
  static model = 'casinoGame'

  static table = 'casino_games'

  static options = {
    name: {
      singular: 'casino_game',
      plural: 'casino_games'
    }
  }

  static indexes = [{
    unique: true,
    fields: ['unique_id', 'casino_provider_id']
  }, 
  // {
  //   unique: true,
  //   fields: ['unique_id', 'casino_provider_id', 'casino_category_id']
  // }
]

  static attributes = {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    uniqueId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    // casinoCategoryId: {
    //   type: DataTypes.BIGINT,
    //   allowNull: false
    // },
    casinoProviderId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    returnToPlayer: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    wageringContribution: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    iconUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    volatilityRating: {
      type: DataTypes.STRING,
      allowNull: true
    },
    hasFreespins: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    devices: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    demoAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    restrictedCountries: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    isFeatured: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    isPlayable: {
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
    },
    moreDetails: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    identifier: {
      type: DataTypes.STRING,
      allowNull: false
    },
    identifier2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    featureGroup: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lines: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    theme: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }

  static associate (models) {
    CasinoGame.hasMany(models.casinoTransaction, { foreignKey: 'gameId' })
    CasinoGame.belongsTo(models.casinoProvider, { foreignKey: 'casinoProviderId' })
    CasinoGame.hasMany(models.casinoGameCategory, { foreignKey: 'casinoGameId' })
    // CasinoGame.belongsTo(models.casinoGameCategory, { foreignKey: 'casinoCategoryId' })
    super.associate()
  }
}
