import { DataTypes } from 'sequelize'
import { BANNER_TYPES } from '@src/utils/constants/public.constants.utils'
import { ModelBase } from '../modelBase'

export class Banner extends ModelBase {
  static model = 'banner'
  static table = 'banners'
  static options = {
    name: {
      singular: 'banner',
      plural: 'banners'
    }
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM(Object.values(BANNER_TYPES)),
      allowNull: false,
      unique: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    ctaText: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    heading: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    headingIcon: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    headingLink: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    text1: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    text2: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    ctaLink: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null
    },
    mobileImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    bannerLink: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    carousalImage1Url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    carousalImage2Url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    carousalImage3Url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
    carousalImage4Url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: ''
    },
  }

  static associate (models) {
    super.associate()
  }
}
