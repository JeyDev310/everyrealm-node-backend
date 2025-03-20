import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class UsersDepositAddress extends ModelBase {
  static model = 'usersDepositAddress'

  static table = 'users_deposit_addresses'

  static options = {
    name: {
      singular: 'users_deposit_address',
      plural: 'users_deposit_addresses'
    }
  }

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    tokenId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    currencyId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    networkAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    addressId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
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
    UsersDepositAddress.belongsTo(models.currency, { foreignKey: 'currencyId' })
    UsersDepositAddress.belongsTo(models.cryptoToken, { foreignKey: 'tokenId' })
    UsersDepositAddress.belongsTo(models.user, { foreignKey: 'userId' })
    super.associate()
  }
}
