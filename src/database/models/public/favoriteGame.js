import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class FavoriteGame extends ModelBase {
  static model = 'favoriteGame'

  static table = 'favorite_games'

  static options = {
    name: {
      singular: 'favorite_game',
      plural: 'favorite_games'
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
    casinoGameId: {
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
    FavoriteGame.belongsTo(models.user, { foreignKey: 'userId' })
    FavoriteGame.belongsTo(models.casinoGame, { foreignKey: 'casinoGameId' })
    super.associate()
  }
}
