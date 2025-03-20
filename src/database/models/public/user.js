import { USER_GENDER } from '@src/utils/constants/public.constants.utils'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class User extends ModelBase {
  static model = 'user'

  static table = 'users'

  static options = {
    name: {
      singular: 'user',
      plural: 'users'
    }
  }

  static jsonSchemaOptions = {
    exclude: ['password']
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    privyId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    phoneCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    languageId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    dateOfBirth: {
      type: DataTypes.DATE,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM(Object.values(USER_GENDER)),
      allowNull: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true
    },
    loggedIn: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lastLoggedInIp: {
      type: DataTypes.STRING,
      allowNull: true
    },
    loggedInAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    kycStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    loyaltyPoints: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    countryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sessionLimit: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    publicAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    occupation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    nonce: {
      type: DataTypes.STRING,
      allowNull: true
    },
    uniqueId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4
    },
    veriffApplicantId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    moreDetails: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        personalDetails: false,
        additionalVerification: 0
      },
    },
    veriffStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    waggeredAmount: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    lockWithdrawals: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    specificPlayerTotalWithdrawalLimit: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0
    },
    specificPlayerTotalDailyWithdrawalLimit: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      defaultValue: 0.0
    },
    telegramChatId: {
      type: DataTypes.BIGINT,
      allowNull: true,
    }
  }

  static associate (models) {
    User.hasOne(models.userComment, { foreignKey: 'userId', onDelete: 'cascade' })
    User.hasMany(models.review, { foreignKey: 'userId', onDelete: 'cascade' })
    User.hasMany(models.wallet, { foreignKey: 'userId', onDelete: 'cascade' })
    User.hasMany(models.document, { foreignKey: 'userId', onDelete: 'cascade' })
    User.hasMany(models.userLimit, { foreignKey: 'userId', onDelete: 'cascade' })
    User.hasMany(models.withdrawal, { foreignKey: 'userId', onDelete: 'cascade' })
    User.hasMany(models.address, { foreignKey: 'userId', onDelete: 'cascade' })
    User.hasMany(models.userTag, { foreignKey: 'userId', onDelete: 'cascade' })
    User.belongsTo(models.country, { foreignKey: 'countryId' })
    User.belongsTo(models.language, { foreignKey: 'languageId' })
    User.hasMany(models.usersDepositAddress, { foreignKey: 'userId', onDelete: 'cascade' })
    super.associate()
  }
}
