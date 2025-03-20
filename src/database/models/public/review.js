import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Review extends ModelBase {
  static model = 'review'

  static table = 'reviews'

  static options = {
    name: {
      singular: 'review',
      plural: 'reviews'
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
    comment: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    Review.belongsTo(models.user, { foreignKey: 'userId' })
    super.associate()
  }
}
