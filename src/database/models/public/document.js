import { DOCUMENT_STATUS_TYPES } from '@src/utils/constants/public.constants.utils'
import { DataTypes } from 'sequelize'
import { ModelBase } from '../modelBase'

export class Document extends ModelBase {
  static model = 'document'

  static table = 'documents'

  static options = {
    name: {
      singular: 'document',
      plural: 'documents'
    }
  }

  static indexes = [{
    unique: true,
    fields: ['user_id', 'document_label_id']
  }]

  static attributes = {
    id: {
      allowNull: false,
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    actioneeId: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    documentLabelId: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM(Object.values(DOCUMENT_STATUS_TYPES)),
      allowNull: false,
      defaultValue: DOCUMENT_STATUS_TYPES.PENDING
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    documentName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    signature: {
      type: DataTypes.STRING,
      allowNull: true
    },
    veriffApplicantId: {
      type: DataTypes.STRING,
      allowNull: true
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
    Document.belongsTo(models.user, { foreignKey: 'userId' })
    Document.belongsTo(models.adminUser, { foreignKey: 'actioneeId' })
    Document.belongsTo(models.documentLabel, { foreignKey: 'documentLabelId' })
    super.associate()
  }
}
