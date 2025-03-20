import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class UserComment extends ModelBase {
  static model = 'userComment'

  static table = 'user_comments'

  static options = {
    name: {
      singular: 'userComment',
      plural: 'userComments'
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
      allowNull: false,
      unique: true
    },
    commenterId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
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
    UserComment.belongsTo(models.user, { foreignKey: 'userId' })
    UserComment.belongsTo(models.adminUser, { foreignKey: 'commenterId' })
    super.associate()
  }
}
