import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class CasinoGameCategory extends ModelBase {
  static model = 'casinoGameCategory'

  static table = 'casino_game_category'

  static options = {
    name: {
      singular: 'casino_game_category',
      plural: 'casino_game_category'
    }
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    orderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    casinoGameId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    casinoCategoryId: {
      type: DataTypes.BIGINT,
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
    CasinoGameCategory.belongsTo(models.casinoGame, { foreignKey: 'casinoGameId' })
    CasinoGameCategory.belongsTo(models.casinoCategory, { foreignKey: 'casinoCategoryId' })
    super.associate()
  }
}
