import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class UserTag extends ModelBase {
  static model = 'userTag'

  static table = 'user_tags'

  static options = {
    name: {
      singular: 'user_tag',
      plural: 'user_tags'
    }
  }

  static indexes = [{
    unique: true,
    fields: ['user_id', 'tag_id']
  }]

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    tagId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
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
    UserTag.belongsTo(models.user, { foreignKey: 'userId' })
    UserTag.belongsTo(models.tag, { foreignKey: 'tagId' })
    super.associate()
  }
}
