import { EMAIL_TEMPLATE_EVENT_TYPES } from '@src/utils/constants/public.constants.utils'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class EmailTemplate extends ModelBase {
  static model = 'emailTemplate'

  static table = 'email_templates'

  static options = {
    name: {
      singular: 'emailTemplate',
      plural: 'emailTemplates'
    }
  }

  static attributes = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false
    },
    eventType: {
      type: DataTypes.ENUM(Object.values(EMAIL_TEMPLATE_EVENT_TYPES)),
      allowNull: false
    },
    dynamicData: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    templateCode: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    super.associate()
  }
}
