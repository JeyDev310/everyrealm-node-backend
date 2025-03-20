import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class RakebackBoostLevel extends ModelBase {
  static model = 'rakebackBoostLevel'

  static table = 'rakeback_boost_levels'

  static attributes = {
    id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    balanceRequired:{
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0
    },
    reward: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date()
    },
  }
}
